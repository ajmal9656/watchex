const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const ObjectId = require("mongoose").Types.ObjectId;

const getAllCartItems = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const userCartData = await cartModel.aggregate([
      {
        $match: { user: new ObjectId(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: "$products.productItemId",
          quantity: "$products.quantity",
          size: "$products.size",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          _id: 1,
          size: 1,
          product: {
            $arrayElemAt: ["$product", 0],
          },
        },
      },
    ]);
    resolve(userCartData);
  });
};

const addProductToCart = async (productId, userId, size) => {
  return new Promise(async (resolve, reject) => {
    const product = await productModel.findById(productId);

    const cartData = await cartModel.updateOne(
      { user: userId },
      {
        $push: {
          products: { productItemId: productId, quantity: 1, size: size },
        },
      },
      { upsert: true }
    );
    resolve(cartData);
  });
};

const checkCart = async (productId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const check = await cartModel.findOne({
        user: userId,
        "products.productItemId": productId,
      });

      if (check) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const quantityUpdation = async (productId, userId, quantity,size) => {
  return new Promise(async (resolve, reject) => {
    const cart = await cartModel.findOne({ user: userId });

    const product = cart.products.find((item) => {
      return item.productItemId.toString() == productId;
    });

    const productSizeCount = await productModel.aggregate([{$match:{_id:new ObjectId(productId)}},{
      $project:{item:"$product_quantity"}
    }])
    

    function findValueForSize(productSizeCount, size) {
      let item = productSizeCount[0].item; // Assuming there's only one object in the array
      if (item.hasOwnProperty(size)) {
        return item[size].quantity;
      } else {
        return null; // Size not found
      }
    }
    const sizeCount = findValueForSize(productSizeCount, size);

    



    let newQuantity = product.quantity + parseInt(quantity);

    // if (newQuantity < 1) {
    //   newQuantity = 1;
    // }
    
    product.quantity = newQuantity;
    await cart.save();

    let sizes={};

    if(product.quantity===1){
      sizes.sizeLimit=true;
      sizes.cart=cart;
      resolve(sizes);

    }

  if(product.quantity==sizeCount){
  
      
      sizes.sizeExceed=true;
      sizes.cart=cart;
      resolve(sizes);


    }

    
    resolve(cart);
  });
};

const removeItem = async (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    const removeItem = await cartModel.updateOne(
      { user: userId },
      { $pull: { products: { productItemId: productId } } }
    );

    resolve(removeItem);
  });
};
const totalSubtotal = async (userId, cartItems) => {
  return new Promise(async (resolve, reject) => {
    let cart = await cartModel.findOne({ user: userId });
    let total = 0;
    if (cart) {
      if (cartItems.length) {
        for (let i = 0; i < cartItems.length; i++) {
          total =
            total +
            cartItems[i].quantity *
              Math.round(
                cartItems[i].product.product_price -
                  (cartItems[i].product.product_price *
                    cartItems[i].product.product_discount) /
                    100
              );
        }
      }
      cart.totalAmount = total;
      await cart.save();

      resolve(total);
    } else {
      resolve(total);
    }
  });
};

const clearAllCartItems = (userId) => {
  return new Promise(async (resolve, reject) => {
    const removeCartItems = await cartModel.deleteOne({ user: userId });
    resolve(removeCartItems);
  });
};

const getCart = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const allCartData = await cartModel.aggregate([
      {
        $match: { user: new ObjectId(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: "$products.productItemId",
          quantity: "$products.quantity",
          size: "$products.size",
        },
      },
    ]);
    resolve(allCartData);
  });
};

const userCartCount = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const result = await cartModel.aggregate([{$match:{user:new ObjectId(userId)}},
      {
        $project: {
          numberOfProducts: { $size: "$products" }
        }
      }
    ])
    
    
    if (result.length > 0) {
      resolve(result[0].numberOfProducts) ;
    } else {
      resolve(0) ; // Return 0 if no products are found in the cart
    }
    
  });
};
    

module.exports = {
  getAllCartItems,
  addProductToCart,
  checkCart,
  quantityUpdation,
  removeItem,
  totalSubtotal,
  clearAllCartItems,
  getCart,
  userCartCount
};
