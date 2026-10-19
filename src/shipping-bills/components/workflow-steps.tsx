import { workflowSteps } from '../workflow'

/** The export job's steps, with the shipping bill (the current one) highlighted. */
export function WorkflowSteps() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {workflowSteps.map((step, index) => {
        const isCurrent = step.id === 'shipping-bill'
        return (
          <div
            key={step.id}
            className={`rounded-lg border p-3 ${isCurrent ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs">{index + 1}</span>
              {step.title}
            </div>
            <p className="ml-8 text-xs text-gray-500">{step.description}</p>
          </div>
        )
      })}
    </div>
  )
}
