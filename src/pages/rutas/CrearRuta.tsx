import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Stepper from "@/components/rutas/Stepper";
import Step1DatosRuta from "@/components/rutas/Step1DatosRuta";
import Step2AsignarResponsables from "@/components/rutas/Step2AsignarResponsables";
import Step3AsignarEstudiantes from "@/components/rutas/Step3AsignarEstudiantes";
import Step4Revision from "@/components/rutas/Step4Revision";
import {
  buses,
  conductores,
  coordinadores,
  sedes,
  estudiantes,
  apiResponses,
  Conductor,
  Coordinador,
  Bus,
} from "@/services/mockData";

const steps = [
  { number: 1, label: "Datos de la ruta" },
  { number: 2, label: "Asignar responsables" },
  { number: 3, label: "Asignar estudiantes" },
  { number: 4, label: "Revisión" },
];

const CrearRuta = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [conductoresList, setConductoresList] = useState(conductores);
  const [coordinadoresList, setCoordinadoresList] = useState(coordinadores);
  const [busesList, setBusesList] = useState(buses);

  // Form state
  const [formData, setFormData] = useState({
    nombreRuta: "",
    busId: "",
    sedeId: "",
    conductorId: "",
    coordinadorId: "",
    estudiantesIds: [] as string[],
  });

  // Get bus capacity
  const selectedBus = busesList.find((b) => b.id === formData.busId);
  const capacidad = selectedBus?.capacidad || 40;

  // Get selected sede
  const selectedSede = sedes.find((s) => s.id === formData.sedeId);

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleCreateConductor = async (newConductor: Omit<Conductor, "id">) => {
    const result = await apiResponses.createConductor(newConductor);
    if (result.success) {
      setConductoresList((prev) => [...prev, result.data]);
      setFormData((prev) => ({ ...prev, conductorId: result.data.id }));
      toast({
        title: "Conductor creado",
        description: `${result.data.nombre} ha sido agregado exitosamente.`,
      });
    }
  };

  const handleCreateCoordinador = async (newCoordinador: Omit<Coordinador, "id">) => {
    const result = await apiResponses.createCoordinador(newCoordinador);
    if (result.success) {
      setCoordinadoresList((prev) => [...prev, result.data]);
      setFormData((prev) => ({ ...prev, coordinadorId: result.data.id }));
      toast({
        title: "Coordinador/a creado",
        description: `${result.data.nombre} ha sido agregado/a exitosamente.`,
      });
    }
  };

  const handleCreateBus = async (newBus: Omit<Bus, "id">) => {
    const result = await apiResponses.createBus(newBus);
    if (result.success) {
      setBusesList((prev) => [...prev, result.data]);
      setFormData((prev) => ({ ...prev, busId: result.data.id }));
      toast({
        title: "Bus registrado",
        description: `El bus ${result.data.placa} ha sido registrado exitosamente.`,
      });
    }
  };

  const handleToggleEstudiante = (id: string) => {
    setFormData((prev) => {
      const isAsignado = prev.estudiantesIds.includes(id);
      if (isAsignado) {
        return {
          ...prev,
          estudiantesIds: prev.estudiantesIds.filter((eid) => eid !== id),
        };
      } else if (prev.estudiantesIds.length < capacidad) {
        return {
          ...prev,
          estudiantesIds: [...prev.estudiantesIds, id],
        };
      }
      return prev;
    });
  };

  const handleFinish = async () => {
    const result = await apiResponses.createRuta({
      nombre: formData.nombreRuta,
      busId: formData.busId,
      conductorId: formData.conductorId,
      coordinadorId: formData.coordinadorId,
      sedeId: formData.sedeId,
      estudiantes: formData.estudiantesIds,
      estado: "activa",
    });

    if (result.success) {
      toast({
        title: "Ruta creada exitosamente",
        description: `La ruta "${formData.nombreRuta}" ha sido creada.`,
      });
      navigate("/");
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary hover:bg-primary/10 h-9 w-9 md:h-10 md:w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Crear ruta</h1>
        </div>
        <div className="hidden sm:block text-sm text-muted-foreground">
          Rutas / <span className="text-foreground">Crear ruta</span>
        </div>
      </div>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step Content */}
      <div className="mt-6">
        {currentStep === 1 && (
          <Step1DatosRuta
            formData={{
              nombreRuta: formData.nombreRuta,
              busId: formData.busId,
              sedeId: formData.sedeId,
            }}
            buses={busesList}
            sedes={sedes}
            onFormDataChange={handleFormDataChange}
            onCreateBus={handleCreateBus}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2AsignarResponsables
            conductores={conductoresList}
            coordinadores={coordinadoresList}
            selectedConductorId={formData.conductorId}
            selectedCoordinadorId={formData.coordinadorId}
            onConductorChange={(id) => handleFormDataChange({ conductorId: id })}
            onCoordinadorChange={(id) => handleFormDataChange({ coordinadorId: id })}
            onCreateConductor={handleCreateConductor}
            onCreateCoordinador={handleCreateCoordinador}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3AsignarEstudiantes
            estudiantes={estudiantes}
            asignados={formData.estudiantesIds}
            capacidad={capacidad}
            sede={selectedSede}
            onToggleEstudiante={handleToggleEstudiante}
            onBack={() => setCurrentStep(2)}
            onSkip={handleSkip}
            onFinish={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <Step4Revision
            formData={formData}
            buses={busesList}
            sedes={sedes}
            conductores={conductoresList}
            coordinadores={coordinadoresList}
            estudiantes={estudiantes}
            onBack={() => setCurrentStep(3)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
};

export default CrearRuta;
