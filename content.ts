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
  buttonSelector: "button.c-pwa-size-guide-link",
  sizeContentLoader: ".c-pwa-size-guide-table",
  sizeTableSelector: ".c-pwa-size-guide-table"
  },
  "ae.com": {
    buttonSelector: 'button[data-test-btn="showSizeDetails"]',
    sizeContentLoader: '._size-chart_lmu52w',
    sizeTableSelector: '.modal-body.modal-size-details-body'
  },
  "anthropologie.com":{
  buttonSelector: ".c-pwa-size-guide-link",
  sizeContentLoader: "",
  sizeTableSelector: ""
  },
  "fashionnova.com": {
    buttonSelector: "button[data-testid='product-size-chart']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "jcrew.com": {
    buttonSelector: "button:has(.SizeChart__label___K_rgE)", // Or you could use [class*='SizeChart__label']
    sizeContentLoader: "", 
    sizeTableSelector: "" 
  },
  "pacsun.com": {
    buttonSelector: ".size-chart a",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "thenorthface.com": {
    buttonSelector: "#pdp-size-chart",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "asos.com": {
    buttonSelector: "button[data-testid='size-guide-button']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "hm.com": {
    buttonSelector: "button[aria-label='Open size guide']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "zara.com": {
    buttonSelector: "button[data-qa-action='open-interactive-size-guide-accordion']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "adidas.com": {
    buttonSelector: "button[data-auto-id='size-chart-link']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "bananarepublic.gap.com": {
    buttonSelector: "button.size-guide-button-text[data-testid='size-guide-button']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "jockey.com": {
    buttonSelector: "a[data-cyid='open-sizechart-btn']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "express.com": {
    buttonSelector: "button[title*='Size Chart Button']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "saksfifthavenue.com": {
    buttonSelector: "button[data-testid='selectionsContainer.sizes.header.sizeGuideButton']",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "bloomingdales.com": {
    buttonSelector: "button.link-sm.margin-left-xxxs",
    sizeContentLoader: "",
    sizeTableSelector: ""
  },
  "kohls.com": {
    buttonSelector: "",
    sizeContentLoader: "",
    sizeTableSelector: ""
  }
}
// forever21 does not have size, uniqlo need to click twice, kohls.com does not need clikc to open
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
