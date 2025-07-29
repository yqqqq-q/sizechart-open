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
    const existing = document.querySelector(selector)
    if (existing) return resolve(existing)

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
      reject(`⏳ Timeout: ${selector} not found`)
    }, timeout)
  })

function simulateClick(el: HTMLElement) {
  
  ["pointerdown", "mousedown", "mouseup", "pointerup", "click"].forEach((type) => {
    el.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true
      })
    )
  })
  try {
    el.click()
  } catch (err) {
    console.warn("⚠️ Fallback click() failed:", err)
  }
}

// Generalized site config
type SiteSelectorConfig = {
  buttonSelector: string
  sizeContentLoader?: string
  sizeTableSelector?: string
}

const siteConfigs: Record<string, SiteSelectorConfig> = {
  "shein.com": {
    buttonSelector: ".product-intro__size-guide",
    sizeContentLoader: ".bsc-common-size-table__content_inner-table",
    sizeTableSelector: ".bsc-common-size-table__content_inner-table"
  },
  "macys.com": {
    buttonSelector: "button.link-sm.margin-left-xxxs",
    sizeContentLoader: "table.size-chart-table, img.size-chart-img"
  },
  // ... additional mappings (keep your existing ones)
}

function getSiteConfig(): SiteSelectorConfig | null {
  const host = window.location.hostname
  const domains = Object.keys(siteConfigs).sort((a, b) => b.length - a.length)

  for (const domain of domains) {
    if (host.endsWith(domain)) {
      return siteConfigs[domain]
    }
  }
  return null
}



async function handleSizeChart() {
  let config = getSiteConfig()

  // If no config found, try generic fallback
  if (!config) {
    console.warn("⚠️ Unsupported site. Trying fallback button detection...")
    const possibleLabels = ["size guide", "size guides", "size chart", "size charts"]

    const genericButton = Array.from(
      document.querySelectorAll("button, a, div[role='button'], div[data-testid='link'], span")
    ).find((el) => {
      const text = el.textContent?.trim().toLowerCase() || ""
      return possibleLabels.some(label => text.includes(label))
    })


  if (genericButton) {
    console.log("✅ Found fallback element:", genericButton)

    simulateClick(genericButton as HTMLElement)
    await new Promise((r) => setTimeout(r, 1500))
  }


    // console.log("button tag",genericButton)

    // if (!genericButton) {
    //   console.error("❌ No fallback size button found.")
    //   return
    // }

    // console.log("✅ Fallback button found. Simulating click...")
    // simulateClick(genericButton as HTMLElement)

    // // Wait for any modal or size-related content to appear
    // await new Promise((r) => setTimeout(r, 2000))

    // const fallbackContent = document.querySelector("table, .modal-content, .size-chart")
    // if (fallbackContent) {
    //   console.log("📏 Fallback Size Chart Content:")
    //   console.log((fallbackContent as HTMLElement).innerHTML)
    // } else {
    //   console.warn("⚠️ Fallback content not found.")
    // }

    return
  }

  // Proceed with configured selectors
  const { buttonSelector, sizeContentLoader, sizeTableSelector } = config

  try {
    console.log("🔍 Looking for size guide button...")
    const button = await waitForElement(buttonSelector)
    console.log("✅ Button found. Simulating click...")
    simulateClick(button as HTMLElement)

    if (sizeContentLoader) {
      console.log("⏳ Waiting for size content loader...")
      await waitForElement(sizeContentLoader)
    }

    let content: HTMLElement | null = null

    if (sizeTableSelector) {
      content = document.querySelector(sizeTableSelector) as HTMLElement
    }

    if (!content) {
      // Generic backup if configured selector fails
      content = document.querySelector("table, .modal-content, .size-chart, iframe") as HTMLElement
    }

    if (content) {
      console.log("📏 Size Chart HTML:")
      console.log(content.innerHTML)
    } else {
      console.warn("⚠️ No content found after button click.")
    }
  } catch (err) {
    console.error("❌ Error while handling size chart:", err)
  }
}
