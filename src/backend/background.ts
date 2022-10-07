// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

export async function test(): Promise<any> {
  return new Promise((resolve: any) => {
    setTimeout(() => resolve(), 20000);
  });
}

export async function test2(): Promise<any> {
  console.log("test-1");
  await test();
  console.log("test-2 after timeout");
}

export function background(chrome: any): number {
  console.log("starting extension...");
  test2();
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GREETINGS") {
      const message = `Hi ${sender.tab ? "Con" : "Pop"}, my name is Bac. I am from Background. It's great to hear from you.`;

      // Log message coming from the `request` parameter
      console.log(request.payload.message);
      // Send a response message
      sendResponse({
        message,
      });
    }
  });
  return 4;
}
