import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
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
  rutas,
  Conductor,
  Coordinador,
  Bus,
  apiResponses,
} from "@/services/mockData";

const steps = [
  { number: 1, label: "Datos de la ruta" },
  { number: 2, label: "Asignar responsables" },
  { number: 3, label: "Asignar estudiantes" },
  { number: 4, label: "Revisión" },
];

const EditarRuta = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load existing route data
  useEffect(() => {
    const ruta = rutas.find((r) => r.id === id);
    if (ruta) {
      setFormData({
        nombreRuta: ruta.nombre,
        busId: ruta.busId,
        sedeId: ruta.sedeId,
        conductorId: ruta.conductorId,
        coordinadorId: ruta.coordinadorId,
        estudiantesIds: [...ruta.estudiantes],
      });
    } else {
      toast({
        title: "Ruta no encontrada",
        description: "La ruta que intentas editar no existe.",
        variant: "destructive",
      });
      navigate("/");
    }
    setIsLoading(false);
  }, [id, navigate, toast]);

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

  const handleToggleEstudiante = (estId: string) => {
    setFormData((prev) => {
      const isAsignado = prev.estudiantesIds.includes(estId);
      if (isAsignado) {
        return {
          ...prev,
          estudiantesIds: prev.estudiantesIds.filter((eid) => eid !== estId),
        };
      } else if (prev.estudiantesIds.length < capacidad) {
        return {
          ...prev,
          estudiantesIds: [...prev.estudiantesIds, estId],
        };
      }
      return prev;
    });
  };

  const handleFinish = async () => {
    // Update route in mock data
    const rutaIndex = rutas.findIndex((r) => r.id === id);
    if (rutaIndex !== -1) {
      rutas[rutaIndex] = {
        ...rutas[rutaIndex],
        nombre: formData.nombreRuta,
        busId: formData.busId,
        conductorId: formData.conductorId,
        coordinadorId: formData.coordinadorId,
        sedeId: formData.sedeId,
        estudiantes: formData.estudiantesIds,
      };

      toast({
        title: "Ruta actualizada exitosamente",
        description: `La ruta "${formData.nombreRuta}" ha sido actualizada.`,
      });
      navigate("/");
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Editar ruta</h1>
        </div>
        <div className="hidden sm:block text-sm text-muted-foreground">
          Rutas / <span className="text-foreground">Editar ruta</span>
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
            onConductorChange={(conductorId) => handleFormDataChange({ conductorId })}
            onCoordinadorChange={(coordinadorId) => handleFormDataChange({ coordinadorId })}
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
            isEditing
          />
        )}
      </div>
    </div>
  );
};

export default EditarRuta;