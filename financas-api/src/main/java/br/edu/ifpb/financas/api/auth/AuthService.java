package br.edu.ifpb.financas.api.auth;

import br.edu.ifpb.financas.api.security.JwtService;
import br.edu.ifpb.financas.api.user.AppUser;
import br.edu.ifpb.financas.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        AppUser user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        return new AuthResponse(jwtService.generateToken(req.username()), user.getId(), user.getUsername(), user.getName());
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.username()))
            throw new IllegalArgumentException("Username already taken");

        AppUser user = new AppUser();
        user.setUsername(req.username());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setName(req.name());
        AppUser saved = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(req.username()), saved.getId(), saved.getUsername(), saved.getName());
    }

}
