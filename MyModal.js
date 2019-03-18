const template = document.createElement('template')
template.innerHTML = `<slot></slot>`


export default class MyModal extends HTMLElement{

  constructor(){
    super()

    this.focusedElementBeforeModal = null;
    this.firstTabStop = null;
    this.lastTabStop = null;
  }

  connectedCallback(){
    let shadowRoot = this.attachShadow({mode:'open'})

    // clone the template
    let instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    // style the modal
    this.style.position = 'fixed';
    this.style.top = `-${this.clientHeight + 10}px`; // start the modal off the screen

    // set event listener for tabbing
    this.addEventListener('keydown', this.trappedKeyboardHandler )
    
  }
  
  open(){
    this.animate(
      [
        { top: `${-( this.clientHeight + 10 )}px` },
        { top: '0px' }
      ],
      {
        duration: 1000,
        fill:"forwards",
        easing:'ease-in-out'
      }
    )

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

    this.exitKeyboardTrap();
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

}