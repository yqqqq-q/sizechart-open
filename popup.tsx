import React from "react"

const handleHelp = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) return
      const currentTab = tabs[0]

      // auto open size chart
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(() => {
              handleSizeChart()
            }, 3000)
          } else {
            window.addEventListener("DOMContentLoaded", () => {
              setTimeout(() => {
                handleSizeChart()
              }, 3000)
            })
          }
          console.log("The content script has been injected!")

          const waitForElement = (selector, timeout = 10000) =>
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

          function simulateClick(el) {
            ["pointerdown", "mousedown", "mouseup", "pointerup", "click"].forEach((type) => {
              el.dispatchEvent(
                new MouseEvent(type, {
                  bubbles: true,
                  cancelable: true,
                  composed: true
                })
              )
            })
          }

          const siteConfigs = {
            // "example.com": {
            //   buttonSelector: ".size-guide-button",
            //   sizeContentLoader: ".loading-spinner",
            //   sizeTableSelector: ".size-chart"
            // }
          }

          function getSiteConfig() {
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
            const config = getSiteConfig()

            if (!config) {
              console.warn("⚠️ Unsupported site. Trying fallback button detection...")
              const possibleLabels = ["size guide", "size guides", "size chart", "size charts"]

              const genericButton = Array.from(
                document.querySelectorAll("button, a, div[role='button'], div[data-testid='link'], span")
              ).find((el) => {
                const text = el.textContent?.trim().toLowerCase() || ""
                return possibleLabels.some((label) => text.includes(label))
              })

              if (genericButton) {
                console.log("✅ Found fallback element:", genericButton)
                simulateClick(genericButton)
                await new Promise((r) => setTimeout(r, 1500))
              }
              return
            }
            else {
              const { buttonSelector, sizeContentLoader, sizeTableSelector } = config

              try {
                console.log("🔍 Looking for size guide button...")
                const button = await waitForElement(buttonSelector)
                console.log("✅ Button found. Simulating click...")
                simulateClick(button)

                if (sizeContentLoader) {
                  console.log("⏳ Waiting for size content loader...")
                  await waitForElement(sizeContentLoader)
                }

                let content = null
                if (sizeTableSelector) {
                  content = document.querySelector(sizeTableSelector)
                }
                if (!content) {
                  content = document.querySelector("table, .modal-content, .size-chart, iframe")
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

          }
        }
      })
    })
}

const Popup = () => {
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", width: 300 }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Size Chart Assistant</h1>
      <button
        onClick={handleHelp}
        style={{
          backgroundColor: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "10px 16px",
          fontSize: 16,
          cursor: "pointer",
          width: "100%"
        }}
      >
        Show Size Chart
      </button>
    </div>
  )
}

export default Popup
