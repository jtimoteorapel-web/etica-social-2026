package com.gh.etica.web;

import com.gh.etica.model.Usuario;
import com.gh.etica.repo.UsuarioRepo;
import com.gh.etica.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String user = body.get("username");
        String pass = body.get("password");

        Usuario u = usuarioRepo.findByUsername(user);
        if (u == null || !u.getPasswordHash().equals(pass)) {
            return Map.of("status", "error", "message", "Credenciales inválidas");
        }

        String token = jwtService.generate(u.getUsername(), u.getRol());
        return Map.of(
                "status", "ok",
                "token", token,
                "rol", u.getRol(),
                "empresa", u.getEmpresaPreferida().toString()
        );
    }

    @GetMapping("/health")
    public String health() {
        return "Servidor operativo";
    }
