import { useEffect, useRef, useState } from 'react'
import { useRhfForm } from '../form'

/* eslint-disable @typescript-eslint/no-unsafe-call */

const enum CaptchaProvider {
  turnstile,
  reCaptcha,
  hCaptcha
}

declare global {
  interface Window {
    onloadTurnstileCallback: () => void
    turnstile: any
    reCaptcha: any
    hCaptcha: any
  }
}

interface Props {
  provider?: CaptchaProvider
  siteKey: string
  className?: string
}

const captchaFormKey = 'captcha'

const divId = 'captcha-div'

export function CaptchaWidget({ provider = CaptchaProvider.turnstile, siteKey, className }: Props) {
  const captchaRef = useRef(null)

  const { register, setValue } = useRhfForm()

  const [isLoaded, setIsLoaded] = useState(false)
  const [widgetId, setWidgetId] = useState<string>()

  function renderCaptcha() {
    const service = getCaptchaService(provider)
    const widgetId = service.render({
      siteKey,
      updateToken: (token) => setValue(captchaFormKey, token)
    })
    setWidgetId(widgetId)
  }

  useEffect(() => {
    const service = getCaptchaService(provider)
    loadScript(service, siteKey, () => setIsLoaded(true))
    register(captchaFormKey)

    return () => {
      if (widgetId != null) service.cleanup?.(widgetId)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) renderCaptcha()
  }, [isLoaded])

  return <div id={divId} ref={captchaRef} className={className}></div>
}

function loadScript(service: CaptchaService, siteKey: string, onLoad: () => void) {
  service.beforeScriptLoad?.(onLoad)

  // Load script if not loaded
  const id = service.id.toString() + '-captcha-script'
  const script = document.getElementById(id)
  if (script == null) {
    const script = document.createElement('script')
    script.id = id
    script.src = service.scriptSrc(siteKey)
    script.async = true
    script.defer = true
    script.onerror = () => {
      console.error('error on script load', { scriptId: id })
    }
    document.head.appendChild(script)
  }

  service.afterScriptLoad?.(onLoad)
}

interface RenderOptions {
  siteKey: string
  updateToken: (token: string) => void
}

interface CaptchaService {
  id: CaptchaProvider
  scriptSrc: (siteKey: string) => string
  render: (opt: RenderOptions) => string
  beforeScriptLoad?: (onLoad: () => void) => void
  afterScriptLoad?: (onLoad: () => void) => void
  cleanup?: (widgetId: string) => void
}

const turnstile: CaptchaService = {
  id: CaptchaProvider.turnstile,
  scriptSrc(_: string) {
    return 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
  },
  render({ updateToken, siteKey }) {
    return window.turnstile.render('#' + divId, {
      sitekey: siteKey,
      callback: function (token: string) {
        updateToken(token)
      }
    }) as string
  },
  beforeScriptLoad(onLoad: () => void) {
    if (window.turnstile) return onLoad()
    window.onloadTurnstileCallback = function () {
      onLoad()
    }
  }
}

const recaptcha: CaptchaService = {
  id: CaptchaProvider.reCaptcha,
  scriptSrc(siteKey: string) {
    return `https://www.google.com/recaptcha/api.js?render=${siteKey}`
  },
  render() {
    return window.reCaptcha.execute('reCAPTCHA_site_key', { action: 'submit' }).then(function (token: string) {
      console.log(token)
    }) as string
  },
  afterScriptLoad(onLoad: () => void) {
    window.reCaptcha.ready(function () {
      onLoad()
    })
  }
}

const hCaptcha: CaptchaService = {
  id: CaptchaProvider.turnstile,
  scriptSrc(_: string) {
    return 'https://js.hcaptcha.com/1/api.js?render=explicit'
  },
  render() {
    return ''
  }
}

function getCaptchaService(provider: CaptchaProvider) {
  switch (provider) {
    case CaptchaProvider.turnstile:
      return turnstile
    case CaptchaProvider.reCaptcha:
      return recaptcha
    case CaptchaProvider.hCaptcha:
      return hCaptcha
  }
}
