package com.crow.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(length = 20)
    private String telefone;

    @Column(name = "data_entrada")
    private LocalDateTime dataEntrada;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ATIVO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.COMUM;

    @PrePersist
    void prePersist() {
        this.dataEntrada = LocalDateTime.now();
    }

    public enum Status {
        ATIVO, INATIVO
    }

    public enum Role {
        COMUM, ADMIN
    }
}
