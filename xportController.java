package com.gh.etica.web;

import com.gh.etica.model.SesionCapacitacion;
import com.gh.etica.repo.SesionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private SesionRepo sesionRepo;

    @GetMapping("/csv")
    public void exportarCSV(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=sesiones.csv");

        List<SesionCapacitacion> sesiones = sesionRepo.findAll();
        PrintWriter writer = response.getWriter();

        writer.println("Empresa,Sector,Fecha,Actividad,Inicio,Fin,Cumplimiento,Observaciones");
        for (SesionCapacitacion s : sesiones) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    s.getEmpresa(),
                    s.getSector(),
                    s.getFecha(),
                    s.getActividad(),
                    s.getHoraInicio(),
                    s.getHoraFin(),
                    s.getCumplimiento(),
                    s.getObservaciones() != null ? s.getObservaciones().replace(",", " ") : ""
            );
        }
        writer.flush();
        writer.close();
    }
}
