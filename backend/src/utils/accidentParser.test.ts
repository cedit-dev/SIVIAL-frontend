import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseAccidentFile } from "./accidentParser.js";

describe("accidentParser", () => {
  it("maps the official CSV layout even when title rows appear first", () => {
    const filePath = path.join(os.tmpdir(), `sinvial-import-${Date.now()}.csv`);
    fs.writeFileSync(
      filePath,
      [
        "AÑO 2023",
        "ENERO",
        "No.,FECHA,HORA,DIA,VIA-KM-SITIO,CLASE ACCIDENTE,FALLECIDO,LESIONADO,ZONA,VEHICULO 1,VEHICULO 2,VEHICULO 3,CONDICIÓN LESIONADO,CONDICIÓN FALLECIDO,SEXO,EDAD,HIPOTESIS",
        "1,26-ene-23,7:05,JUEVES,CALLE 4 No. 22 BARRIO EL MARABEL,CHOQUE,0,2,URBANA,MOTOCICLETA,MOTOCICLETA,*,CONDUCTOR 1 Y 2,*,M/M,59/32,157: SIN INFORMACION."
      ].join("\n"),
      "utf8"
    );

    const parsed = parseAccidentFile(filePath);
    fs.unlinkSync(filePath);

    expect(parsed.errors).toEqual([]);
    expect(parsed.rows[0]).toMatchObject({
      fecha: "2023-01-26",
      hora: "07:05",
      tipo: "choque",
      gravedad: "grave",
      victimas: 2,
      fallecidos: 0,
      lesionados: 2,
      vehiculosInvolucrados: ["motocicleta", "motocicleta"],
      geocodingStatus: "pending"
    });
  });
});
