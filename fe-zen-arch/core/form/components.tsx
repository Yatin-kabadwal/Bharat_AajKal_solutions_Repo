import { describeError } from 'core/utils'
import { Button, ButtonProps } from 'ui/basic/button'
import { FieldValues, FormContext, FormContextData, getFormContext, SubmitHandler } from 'ui/form'
import { AlertDanger } from 'ui/notify/alert'
import { withRetry } from '../retry'

interface FormProps<T extends FieldValues> {
  children: React.ReactNode
  className?: string
  hideError?: boolean
  handleSubmit: SubmitHandler<T>
  ctx: FormContextData<T>
}

export function Form<T extends FieldValues>({ ctx, children, className, handleSubmit, ...props }: FormProps<T>) {
  const formState = ctx.hooks.formState
  const rootError = formState.errors.root

  async function submitHandler(data: T, event?: React.BaseSyntheticEvent) {
    try {
      await withRetry(handleSubmit, data, event)
    } catch (error) {
      const { message, description } = describeError(error)
      ctx.hooks.setError('root', { message: message, type: description })
    }
  }

  return (
    <FormContext.Provider value={ctx}>
      {!props.hideError && rootError && (
        <AlertDanger title={rootError.message!} description={rootError.type as string} className="mb-4" />
      )}

      <form onSubmit={ctx.hooks.handleSubmit(submitHandler)}>
        <fieldset disabled={formState.isSubmitting || formState.isSubmitSuccessful} className={className}>
          {children}
        </fieldset>
      </form>
    </FormContext.Provider>
  )
}

export function SubmitButton({ ...props }: ButtonProps) {
  const {
    hooks: {
      formState: { isSubmitSuccessful, isSubmitting }
    }
  } = getFormContext()

  return <Button {...props} type="submit" loading={isSubmitting} disabled={isSubmitSuccessful} />
}
