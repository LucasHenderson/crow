package com.crow.api.config;

import com.crow.api.entity.Usuario;
import com.crow.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByEmail("admin@crow.com")) {
            Usuario admin = Usuario.builder()
                    .nome("Administrador")
                    .email("admin@crow.com")
                    .senha(passwordEncoder.encode("admin123"))
                    .telefone("63999999999")
                    .role(Usuario.Role.ADMIN)
                    .build();
            usuarioRepository.save(admin);
            log.info("Seed: admin criado com sucesso");
        }

        if (!usuarioRepository.existsByEmail("usuario@crow.com")) {
            Usuario usuario = Usuario.builder()
                    .nome("Usuário Teste")
                    .email("usuario@crow.com")
                    .senha(passwordEncoder.encode("user123"))
                    .telefone("63988888888")
                    .role(Usuario.Role.COMUM)
                    .build();
            usuarioRepository.save(usuario);
            log.info("Seed: usuario criado com sucesso");
        }
    }
}
