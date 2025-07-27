import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

window.addEventListener("load", () => {
  setTimeout(() => {
    handleSizeChart()
  }, 3000)
})

const waitForElement = (selector: string, timeout = 10000): Promise<Element> =>
  new Promise((resolve, reject) => {
    const el = document.querySelector(selector)
    if (el) return resolve(el)

    const observer = new MutationObserver(() => {
      const match = document.querySelector(selector)
      if (match) {
        observer.disconnect()
        resolve(match)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    setTimeout(() => {
      observer.disconnect()
      reject(`⏳⏳Timeout: ${selector} not found`)
    }, timeout)
  })

function fireRealClick(el: Element) {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window
  })
  el.dispatchEvent(event)
}

function simulateVueClick(el: HTMLElement) {
  ["pointerdown", "mousedown", "mouseup", "pointerup", "click"].forEach((type) => {
    el.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerType: "mouse",
      })
    )
  })
}

async function handleSizeChart() {
  try {
    const buttonSelector = ".product-intro__size-guide"
    const sizeTableSelector = "sui-dialog__body" // 👈 target the table directly

    console.log("🔍 Waiting for size guide button...")
    const button = await waitForElement(buttonSelector, 150000)
    console.log("✅ Found button, clicking...")
    // ;(button as HTMLElement).click()
    simulateVueClick(button as HTMLElement)

    console.log("⏳ Waiting for size table to load...")
    const table = await waitForElement(sizeTableSelector, 150000) // ⏱ give more time
    console.log(document.body.innerHTML)


    console.log("📏 Size Chart Table HTML:")
    // console.log((table as HTMLElement).innerHTML)
    console.log("📏 Size Chart HTML:", document.querySelector(".sui-dialog")?.innerHTML)
  } catch (err) {
    console.error("❌ fail:", err)
  }
}

handleSizeChart()
