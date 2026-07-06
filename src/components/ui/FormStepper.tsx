export default function FormStepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <nav aria-label="Form progress" className="mb-6">
      <p className="mb-3 text-sm font-semibold text-foreground">Step {currentStep} of {steps.length}: {steps[currentStep - 1]}</p>
      <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => <li key={step} aria-current={index + 1 === currentStep ? "step" : undefined} className={`h-2 rounded-full ${index + 1 <= currentStep ? "bg-obaol-500" : "bg-default-200"}`}><span className="sr-only">{step}</span></li>)}
      </ol>
    </nav>
  );
}
