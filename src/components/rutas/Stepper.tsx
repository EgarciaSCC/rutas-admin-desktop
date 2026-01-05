import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="flex items-center justify-center py-4 md:py-6 overflow-x-auto px-2">
      <div className="flex items-center min-w-max">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all duration-300
                    ${isCompleted 
                      ? "bg-success text-success-foreground" 
                      : isCurrent 
                        ? "bg-primary text-primary-foreground ring-2 md:ring-4 ring-primary/20" 
                        : "bg-muted text-muted-foreground border-2 border-border"
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : step.number}
                </div>
                <span 
                  className={`
                    mt-1 md:mt-2 text-[10px] md:text-xs font-medium text-center max-w-[60px] md:max-w-[100px] leading-tight
                    ${isCurrent ? "text-foreground" : "text-muted-foreground"}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div 
                  className={`
                    w-8 md:w-20 h-0.5 mx-1 md:mx-2 -mt-5 md:-mt-6 transition-all duration-300
                    ${isCompleted ? "bg-success" : "bg-border"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
