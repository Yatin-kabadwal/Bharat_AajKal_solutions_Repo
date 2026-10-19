import { navigate } from 'core/routing'
import { RrArrowSmallLeft } from 'icons/rr/fi-rr-arrow-small-left'
import { RrInterrogation } from 'icons/rr/fi-rr-interrogation'
import { Button } from 'ui/basic/button'
import { DarkModeToggleFloating } from 'ui/basic/dark-mode'

interface Props {
  hideHomeNav?: boolean
  hideBack?: boolean
}

export default function NotFound({ hideHomeNav, hideBack }: Props) {
  return (
    <section className="container mx-auto flex items-center px-6 py-12 pt-36">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <p className="bg-gray-10 text-primary-500 rounded-full p-3 text-sm font-medium">
          <RrInterrogation className="size-6" />
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-gray-950">Page not found</h1>
        <p className="mt-4 text-gray-900">The page you are looking for doesn't exist.</p>

        <div className="mt-6 flex w-auto shrink-0 items-center gap-x-3">
          {!hideBack && (
            <Button onClick={() => navigate(-1)}>
              <RrArrowSmallLeft className="mr-2 size-5" />
              <span>Go back</span>
            </Button>
          )}

          {!hideHomeNav && (
            <Button onClick={() => navigate('/')} variant="ghost">
              Take me home
            </Button>
          )}
        </div>
      </div>
      <DarkModeToggleFloating />
    </section>
  )
}
