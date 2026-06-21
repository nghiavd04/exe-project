package com.product.exe.backend.security.oauth2;

import com.product.exe.backend.entity.Customer;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.AuthProvider;
import com.product.exe.backend.enums.Role;
import com.product.exe.backend.repository.CustomerRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    @Transactional
    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String sub = (String) attributes.get("sub");

        if (email == null) {
            throw new InternalAuthenticationServiceException("Không tìm thấy email từ nhà cung cấp OAuth2");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!provider.equals(user.getProvider())) {
                throw new InternalAuthenticationServiceException(
                        "Email already registered with " + user.getProvider() + " provider");
            }
            user.setProviderId(sub);
            user = userRepository.save(user);
        } else {
            user = registerNewOAuth2User(email, name, sub, provider, attributes);
        }

        return OAuth2UserPrincipal.create(user, attributes);
    }

    @Transactional
    private User registerNewOAuth2User(String email, String name, String sub,
                                       AuthProvider provider, Map<String, Object> attributes) {
        User user = User.builder()
                .email(email)
                .provider(provider)
                .providerId(sub)
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        Customer customer = Customer.builder()
                .user(savedUser)
                .fullName(name != null ? name : email.split("@")[0])
                .isActive(true)
                .build();
        customerRepository.save(customer);

        // Gửi lời chào mừng cho tài khoản mới đăng ký qua Google
        notificationService.createNotification(
                savedUser,
                "Chào mừng bạn đến với Dopaless! 🎉",
                "Cảm ơn bạn đã tham gia cùng chúng tôi. Hãy bắt đầu cải thiện thói quen của mình bằng cách thực hiện bài trắc nghiệm Dopamine đầu tiên nhé!"
        );

        savedUser.setCustomer(customer);
        return userRepository.save(savedUser);
    }
}
