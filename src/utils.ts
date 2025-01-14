export const IS_BROWSER =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.navigator !== 'undefined'

export const IS_ANDROID =
  IS_BROWSER && /android/i.test(window.navigator.userAgent) // Bad, but needed

export const IS_IOS =
  IS_BROWSER && /iPad|iPhone|iPod/.test(window.navigator.userAgent) // Bad, but needed

// Constants for better compression and control
export const BLOCK = ':host(:not([hidden])) { display: block }'
export const CONTROLS = 'aria-controls'
export const DISABLED = 'aria-disabled'
export const EXPANDED = 'aria-expanded'
export const LABELLEDBY = IS_ANDROID ? 'data-labelledby' : 'aria-labelledby' // Android reads tab text instead of content when labelledby
export const SELECTED = 'aria-selected'

export const on = (
  element: Node | Window,
  ...rest: Parameters<typeof Element.prototype.addEventListener>
): void =>
  rest[0].split(',').forEach((type) => {
    rest[0] = type
    Element.prototype.addEventListener.apply(element, rest)
  })

export const off = (
  element: Node | Window,
  ...rest: Parameters<typeof Element.prototype.removeEventListener>
): void =>
  rest[0].split(',').forEach((type) => {
    rest[0] = type
    Element.prototype.removeEventListener.apply(element, rest)
  })

/**
 * style
 * @param element The Element to scope styles for
 * @param css The css to inject
 */
export const style = (element: Element, css: string) => {
  const shadow = element.attachShadow({ mode: 'open' })
  shadow.appendChild(document.createElement('style')).textContent = css
  shadow.appendChild(document.createElement('slot'))
}

export function attr(
  element: unknown,
  name: string | object,
  value?: string | number | boolean | null
): string | null | void {
  if (element instanceof Element) {
    if (typeof name === 'object')
      Object.entries(name).map(([name, value]) => attr(element, name, value))
    else if (value === undefined) return element.getAttribute(name)
    else if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, String(value))
  }
}

const observers = new WeakMap()
export const mutationObserver = (
  element: Element & EventListenerObject,
  options?: MutationObserverInit | false
) => {
  try {
    observers.get(element).disconnect() // Allways unbind previous listener
    observers.delete(element)
  } catch (err) {
    // Could not unount since element is removed
  }
  if (options) {
    const observer = new MutationObserver((detail) =>
      element.handleEvent({ type: 'mutation', detail } as CustomEvent)
    )
    observer.observe(element, options)
    observers.set(element, observer)
  }
}

export const asButton = (event: Event): boolean => {
  const isClick = 'key' in event && (event.key === ' ' || event.key === 'Enter')
  if (isClick) event.preventDefault() // Prevent scroll
  if (isClick && event.target instanceof HTMLElement) event.target.click() // Forward to real click
  return isClick
}

/**
 * getRoot
 * @description Helper for minifying and better typescript typing
 * @param element The target object
 * @param name The event name
 * @param options Detail object (bubbles and cancelable is set to true)
 * @return Whether the event was canceled. Returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
 */
export const getRoot = (node: Node) =>
  node.getRootNode() as Document | ShadowRoot

/**
 * useId
 * @return A generated unique ID
 */
let id = Date.now()
export const useId = (el?: Element | null) =>
  el
    ? (el.id = el.id || `:${el.nodeName.toLowerCase()}${(++id).toString(32)}`)
    : undefined
