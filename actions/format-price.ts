const formatPrice = (price:number) => {
    const fixedPrice=parseFloat(price.toFixed(2));

    return new Intl.NumberFormat('es-CO',{
        style: 'currency',
        currency: 'COP',
        
    }).format(fixedPrice)+'COP'
    
}
 
export default formatPrice;