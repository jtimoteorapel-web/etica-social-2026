package com.gh.etica.web;

import com.gh.etica.model.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogosController {

    @GetMapping("/empresas")
    public List<Empresa> empresas() {
        return Arrays.asList(Empresa.values());
    }

    @GetMapping("/sectores")
    public List<Sector> sectores() {
        return Arrays.asList(Sector.values());
    }

    @GetMapping("/actividades")
    public List<Actividad> actividades() {
        return Arrays.asList(Actividad.values());
    }

    @GetMapping("/estados")
    public List<EstadoCumplimiento> estados() {
        return Arrays.asList(EstadoCumplimiento.values());
    }
}