package com.gh.etica.web;

import com.gh.etica.model.SesionCapacitacion;
import com.gh.etica.repo.SesionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/sesiones")
public class SesionesController {

    @Autowired
    private SesionRepo sesionRepo;

    @GetMapping
    public List<SesionCapacitacion> listar() {
        return sesionRepo.findAll();
    }

    @PostMapping
    public SesionCapacitacion guardar(@RequestBody SesionCapacitacion sesion) {
        return sesionRepo.save(sesion);
    }

    @PutMapping("/{id}")
    public SesionCapacitacion actualizar(@PathVariable Long id, @RequestBody SesionCapacitacion sesion) {
        SesionCapacitacion existente = sesionRepo.findById(id).orElseThrow();
        existente.setCumplimiento(sesion.getCumplimiento());
        existente.setObservaciones(sesion.getObservaciones());
        existente.setMotivoRetraso(sesion.getMotivoRetraso());
        existente.setEnviadoEnFecha(sesion.isEnviadoEnFecha());
        return sesionRepo.save(existente);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> eliminar(@PathVariable Long id) {
        sesionRepo.deleteById(id);
        return Map.of("status", "ok");
    }
}