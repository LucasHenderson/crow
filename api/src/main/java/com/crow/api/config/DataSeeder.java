package com.crow.api.config;

import com.crow.api.entity.Usuario;
import com.crow.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Senha do admin na primeira subida com o banco vazio. Em produção vem do
     * ambiente; depois de criado, o admin não é mais alterado por aqui.
     */
    @Value("${app.seed.admin-senha:admin123}")
    private String senhaAdmin;

    /** Usuário de teste ({@code usuario@crow.com}) — desligado em produção. */
    @Value("${app.seed.usuario-teste:true}")
    private boolean criarUsuarioTeste;

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByEmail("admin@crow.com")) {
            Usuario admin = Usuario.builder()
                    .nome("Administrador")
                    .email("admin@crow.com")
                    .senha(passwordEncoder.encode(senhaAdmin))
                    .telefone("63999999999")
                    .role(Usuario.Role.ADMIN)
                    .build();
            usuarioRepository.save(admin);
            log.info("Seed: admin criado com sucesso");
        }

        if (criarUsuarioTeste && !usuarioRepository.existsByEmail("usuario@crow.com")) {
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
