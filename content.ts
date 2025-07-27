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


// Add selectors for supported domains
const siteConfigs: {
  [key: string]: {
    buttonSelector: string
    sizeContentLoader: string
    sizeTableSelector: string
  }
} = {
  "shein.com": {
    buttonSelector: ".product-intro__size-guide",
    sizeContentLoader: ".bsc-common-size-table__content_inner-table",
    sizeTableSelector: ".bsc-common-size-table__content_inner-table"
  },
  "macys.com": {
    buttonSelector: "button.link-sm.margin-left-xxxs", 
    sizeContentLoader: "table.size-chart-table, img.size-chart-img",
    sizeTableSelector: "table.size-chart-table, img.size-chart-img"
  },
  "gap.com": { //iframe 
    buttonSelector: "button.size-guide-button", 
    sizeContentLoader: ".pdp-core-ui-modal.size-guide-modal",
    sizeTableSelector: ".pdp-core-ui-modal.size-guide-modal"
  },
  "nordstrom.com": {
    buttonSelector: ".gI46s.dls-14kp4cn",
    sizeContentLoader: ".QGa7g.eQC6D.uU9gY",
    sizeTableSelector: "table.VyXHE"
  },
  "nike.com": { //opened a new window
    buttonSelector: "a[data-testid=\"pdp_sizeGuide\"]",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "oldnavy.gap.com": { //iframe 
    buttonSelector: "button.size-guide-button-text", 
    sizeContentLoader: "iframe#iframe-size-guide",
    sizeTableSelector: "iframe#iframe-size-guide"
  },
  "shop.lululemon.com": { //opened a new window at the same page
    buttonSelector: "a[data-testid=\"size-guide-link\"]", 
    sizeContentLoader: "iframe#iframe-size-guide",
    sizeTableSelector: "iframe#iframe-size-guide"
  },
  "victoriassecret.com": {
  buttonSelector: 'button[data-testid="SizeAndFit"]',
  sizeContentLoader: 'article.react-cms-component-list.fabric-cms-component-list',
  sizeTableSelector: 'article.react-cms-component-list.fabric-cms-component-list > *'
  },
  "urbanoutfitters.com": {
    
  }
}
function getSelectorsByDomain(): {
  buttonSelector: string
  sizeContentLoader: string
  sizeTableSelector: string
} | null {
  const host = window.location.hostname

  const sortedDomains = Object.keys(siteConfigs).sort((a, b) => b.length - a.length)

  for (const domain of sortedDomains) {
    if (host.endsWith(domain)) {
      return siteConfigs[domain]
    }
  }

  return null
}


async function handleSizeChart() {
  const config = getSelectorsByDomain()

  if (!config) {
    console.log("⚠️ Website not listed in supported domains")
    return
  }

  const { buttonSelector,sizeContentLoader, sizeTableSelector } = config

  try {
    console.log("🔍 Waiting for size guide button...")
    const button = await waitForElement(buttonSelector)
    console.log("✅ Found button, clicking...")
    simulateVueClick(button as HTMLElement)

    console.log("⏳ Waiting for size table to load...")
    await waitForElement(sizeContentLoader)
    // const table = await waitForElement(sizeTableSelector)
    const table = document.querySelector(sizeTableSelector)
    console.log("📏 Size Chart Table HTML:")
    console.log("hahahahahhaha",(table as HTMLElement).innerHTML)
  } catch (err) {
    console.error("❌ Fail:", err)
  }
}
