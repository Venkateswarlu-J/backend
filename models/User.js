const mongoose=require('mongoose')

const UserSchema=new mongoose.Schema({
    username:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true},
    cart: {
        items: [
          {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // 🔥 Store only product ID
            quantity: { type: Number, required: true, default: 1 },
          },
        ],
      },
});


UserSchema.methods.addToCart = async function (productId) {
    const cartItemIndex = this.cart.items.findIndex(item => item.product.toString() === productId.toString());

    if (cartItemIndex > -1) {
        this.cart.items[cartItemIndex].quantity += 1;
    } else {
        this.cart.items.push({ product: productId, quantity: 1 });
    }

    await this.save();
    return this.cart;
};

// Function to remove an item from the cart
UserSchema.methods.removeFromCart = async function (productId) {
    this.cart.items = this.cart.items.filter(item => item.product.toString() !== productId.toString());
    await this.save();
    return this.cart;
};

// Function to clear the cart
UserSchema.methods.clearCart = async function () {
    this.cart.items = [];
    await this.save();
    return this.cart;
};
module.exports=mongoose.model("User",UserSchema);