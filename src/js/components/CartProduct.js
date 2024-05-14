import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    let thisCartProduct = this;

    //console.log('menuProduct:', menuProduct);

    // thisCartProduct = {
    //   ...menuProduct
    // }

    
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;
    

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();

    thisCartProduct.initActions();

    
    //console.log('thisCartProduct: ', thisCartProduct);
  }

  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {

      wrapper: element,
      amountWidget: element.querySelector(select.cartProduct.amountWidget),
      price:  element.querySelector(select.cartProduct.price),
      edit: element.querySelector(select.cartProduct.edit),
      remove: element.querySelector(select.cartProduct.remove)

    };
  }

  initAmountWidget(){
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    //console.log('thisCArtProduct.amountWidget: ', thisCartProduct.amountWidget);

    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      //console.log('thisCartProduct.amount: ', thisCartProduct.amount);
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      //console.log('thisCartProduct.price: ', thisCartProduct.price);
      thisCartProduct.dom.price.innerText = thisCartProduct.price;

    });

  }

  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct
      }
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);

  }

  initActions(){
    let thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(){
      console.log('edit!');
    });

    thisCartProduct.dom.remove.addEventListener('click', function(){
      //console.log('remove!');

      thisCartProduct.remove();

    });

  }

  getData(){
    let thisCartProduct = this;

    let productData = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params
    }

    return productData;

  }

}

export default CartProduct;