import React, { useEffect, useState } from 'react'
import { sanitizeHTML } from '../../utils/security'

// HOC para sanitização automática de props
export function withSanitization<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>
) {
  return function SanitizedComponent(props: T) {
    const sanitizedProps = { ...props } as any
    
    // Sanitizar strings nas props
    Object.keys(sanitizedProps).forEach(key => {
      if (typeof sanitizedProps[key] === 'string') {
        sanitizedProps[key] = sanitizeHTML(sanitizedProps[key])
      }
    })

    return <WrappedComponent {...sanitizedProps} />
  }
}

// Componente para renderização segura de HTML
interface SafeHTMLProps {
  html: string
  className?: string
  tag?: keyof JSX.IntrinsicElements
}

export function SafeHTML({ html, className = '', tag: Tag = 'div' }: SafeHTMLProps) {
  const [sanitizedHTML, setSanitizedHTML] = useState('')

  useEffect(() => {
    setSanitizedHTML(sanitizeHTML(html))
  }, [html])

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}

// Hook para detecção de tentativas de XSS
export function useXSSDetection() {
  useEffect(() => {
    const detectXSS = () => {
      // Detectar tentativas comuns de XSS
      const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload=/gi,
        /onclick=/gi,
        /onerror=/gi
      ]

      const checkForXSS = (str: string) => {
        return suspiciousPatterns.some(pattern => pattern.test(str))
      }

      // Monitorar mudanças no DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element
                if (checkForXSS(element.innerHTML)) {
                  console.warn('Possível tentativa de XSS detectada:', element)
                  element.remove()
                }
              }
            })
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      return () => observer.disconnect()
    }

    return detectXSS()
  }, [])
}

// Componente de proteção CSRF
interface CSRFProtectedFormProps {
  children: React.ReactNode
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  className?: string
}

export function CSRFProtectedForm({ children, onSubmit, className = '' }: CSRFProtectedFormProps) {
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    // Gerar token CSRF
    const token = crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
    setCsrfToken(token)
    sessionStorage.setItem('csrf_token', token)
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Verificar token CSRF
    const storedToken = sessionStorage.getItem('csrf_token')
    if (csrfToken !== storedToken) {
      console.error('CSRF token mismatch')
      return
    }

    onSubmit(event)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  )
}

// Hook para monitoramento de segurança
export function useSecurityMonitoring() {
  useEffect(() => {
    // Detectar tentativas de abertura de console
    let devtools = { open: false, orientation: null }
    const threshold = 160

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true
          console.warn('Developer tools opened')
          // Opcional: Implementar ação de segurança
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // Detectar tentativas de modificação do localStorage
    const originalSetItem = localStorage.setItem
    localStorage.setItem = function(key: string, value: string) {
      if (key.startsWith('focovest_') && !key.includes('theme')) {
        console.warn('Tentativa de modificação não autorizada do localStorage:', key)
      }
      return originalSetItem.apply(this, [key, value])
    }

    // Bloquear select de texto sensível
    const preventSelect = (e: Event) => {
      const target = e.target as Element
      if (target.classList.contains('no-select')) {
        e.preventDefault()
      }
    }

    document.addEventListener('selectstart', preventSelect)
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as Element
      if (target.classList.contains('no-context')) {
        e.preventDefault()
      }
    })

    return () => {
      document.removeEventListener('selectstart', preventSelect)
      localStorage.setItem = originalSetItem
    }
  }, [])
}

// Componente para conteúdo protegido
interface ProtectedContentProps {
  children: React.ReactNode
  className?: string
  disableSelect?: boolean
  disableContext?: boolean
}

export function ProtectedContent({ 
  children, 
  className = '', 
  disableSelect = false, 
  disableContext = false 
}: ProtectedContentProps) {
  const classes = [
    className,
    disableSelect ? 'no-select select-none' : '',
    disableContext ? 'no-context' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {children}
    </div>
  )
}