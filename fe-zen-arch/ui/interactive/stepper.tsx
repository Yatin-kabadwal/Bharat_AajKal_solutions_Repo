import { RrCheckCircle } from 'icons/rr/fi-rr-check-circle'
import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { clsx } from 'ui/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

// TODO: UNUSED COMPONENT

export interface Steps {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function MultiStepProcess({ steps }: { steps: Steps[] }) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  function handleStepChange(stepIndex: number) {
    setCurrentStep(stepIndex)
  }

  function handleStepComplete(stepIndex: number) {
    const stepId = steps[stepIndex].id
    setCompletedSteps((prev) => new Set(prev).add(stepId))
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      {steps.map((step, index) => (
        <Collapsible
          key={step.id}
          isOpen={currentStep == index}
          onClick={(_) => handleStepChange(index)}
          className="foreground m-4 p-4">
          <CollapsibleTrigger className="flex">
            <div className="flex items-center gap-x-4">
              <div className={clsx('rounded-full p-1', completedSteps.has(step.id) ? 'bg-green-500' : 'bg-gray-200')}>
                {completedSteps.has(step.id) ? <RrCheckCircle className="size-5 text-white" /> : step.icon}
              </div>
              <span className="font-medium">{step.title}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4">
              {step.content}
              <div className="mt-4 flex justify-between">
                {index > 0 ? (
                  <Button onClick={() => handleStepChange(index - 1)} variant="outline">
                    Previous
                  </Button>
                ) : (
                  <div /> // empty div for alignment
                )}
                <Button onClick={() => handleStepComplete(index)}>
                  {index === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
