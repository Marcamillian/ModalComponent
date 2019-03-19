// accessibility guidelines - https://www.w3.org/TR/wai-aria-practices-1.1/#alertdialog

const template = document.createElement('template')
template.innerHTML = `
<style>
  :host{
    position: fixed;
    background-color: #000000cc;

    color:white;
    text-align:center;

    flex-direction:column;
    align-items:center;

    width:90%;
    padding: 1em 5%;
    
    z-index: 1;
  }
</style>
<slot></slot>`


export default class MyModal extends HTMLElement{

  constructor(){
    super()

    this.focusedElementBeforeModal = null;
    this.firstTabStop = null;
    this.lastTabStop = null;
    this.overlay = null;
  }

  connectedCallback(){
    let shadowRoot = this.attachShadow({mode:'open'})

    // clone the template
    let instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    // style the modal
    this.style.top = `-${this.clientHeight + 10}px`; // start the modal off the screen

    // set event listener for tabbing
    this.addEventListener('keydown', this.trappedKeyboardHandler )

    // add a modal overlay
    let overlay = document.createElement('div');
    overlay.style.visibility = "hidden";
    overlay.style.position = "fixed";
    overlay.style.backgroundColor = "#000000aa"

    this.overlay = overlay;
    document.body.appendChild(overlay)
    
  }

  open(){

    this.style.display = 'flex'; // show the modal
    this.animate( // animate into position
      [
        { top: `${-( this.clientHeight + 10 )}px` },
        { top: '0px' },
      ],
      {
        duration: 1000,
        fill:"forwards",
        easing:'ease-in-out'
      }
    )

    this.showOverlay()
    this.enterKeyboardTrap();
    
  }

  close(){
    this.animate(
      [
        { top: '0px' },
        { top: `${-( this.clientHeight + 10 )}px` }
      ],
      {
        duration: 1000,
        fill: 'forwards',
        easing:'ease-in-out'
      }
    )
    setTimeout(()=>{
      this.style.display = 'none'
    }, 1000)

    this.exitKeyboardTrap();
    this.hideOverlay()
  }

  trappedKeyboardHandler(event){
    switch(event.keyCode){
      case 9:  // handle tab
        
        if(event.shiftKey){
          if( document.activeElement === this.firstTabStop){
            event.preventDefault()
            this.lastTabStop.focus()
          }
        }else{
          if(document.activeElement == this.lastTabStop){
            event.preventDefault();
            this.firstTabStop.focus()
          }
        }
          
      break;
      case 27:  // handle shift/tab
        this.close()
      break;
    }
  }

  // set up the keyboard trap
  enterKeyboardTrap(){

    // store the pre-modal focused element
    this.focusedElementBeforeModal = document.activeElement;

    // find focusable elements in modal
    const focusableSelectorString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    const focusableElements = [...this.querySelectorAll(focusableSelectorString)]

    this.firstTabStop = focusableElements[0];
    this.lastTabStop = focusableElements[ focusableElements.length -1]

    this.firstTabStop.focus();

  }

  // clear the keyboard trap
  exitKeyboardTrap(){
    if(this.focusedElementBeforeModal) this.focusedElementBeforeModal.focus();

  }

  showOverlay(){
    this.overlay.style.height = `${window.innerHeight}px`;
    this.overlay.style.width = `${window.innerWidth}px`;
    this.overlay.style.visibility = "visible";
  }
  hideOverlay(){
    this.overlay.style.visibility = "hidden";
  }

}