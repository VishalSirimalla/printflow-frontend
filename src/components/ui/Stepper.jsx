export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${isCompleted ? 'bg-blue-700 text-white' : isActive ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-700' : isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-16 mx-2 mb-4 transition-colors ${stepNum < currentStep ? 'bg-blue-700' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
