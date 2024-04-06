const whishlistModel = require("../models/whishlistModel");
const productModel = require("../models/productModel");
const offerModel = require("../models/offerModel");
const cartHelper = require("../helpers/cartHelper");

const ObjectId = require("mongoose").Types.ObjectId;

const getAllWhishlistItems = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const userWhishlistData = await whishlistModel.aggregate([
      {
        $match: { user: new ObjectId(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: "$products.productItemId",
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
          _id: 1,
          product: {
            $arrayElemAt: ["$product", 0],
          },
        },
      },
    ]);

    resolve(userWhishlistData);
  });
};

const addProductToWishlist = async (productId, userId) => {
  return new Promise(async (resolve, reject) => {
    const product = await productModel.findById(productId);

    const wishlistData = await whishlistModel.updateOne(
      { user: userId },
      { $push: { products: { productItemId: productId } } },
      { upsert: true }
    );
    resolve(wishlistData);
  });
};

const removeItem = async (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    

    

    const removeItem = await whishlistModel.updateOne(
      { user: userId },
      { $pull: { products: { productItemId: new ObjectId(productId) } } }
    );

    resolve(removeItem);
  });
};

const checkWishlist = async (productId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const check = await whishlistModel.findOne({
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
const userWishlistCount = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const result = await whishlistModel.aggregate([
      { $match: { user: new ObjectId(userId) } },
      {
        $project: {
          numberOfProducts: { $size: "$products" },
        },
      },
    ]);

    if (result.length > 0) {
      resolve(result[0].numberOfProducts);
    } else {
      resolve(0); // Return 0 if no products are found in the cart
    }
  });
};

const wishlistProductOfferCheck = async (userId, response) => {
  return new Promise(async (resolve, reject) => {
    const currentDate = Date.now();
    
    for (const products of response) {
      const cartStatus = await cartHelper.checkCart(
        products.product._id,
        userId
      );
      if (cartStatus) {
        products.isCart = cartStatus;
      }

      const prodOffers = await offerModel.findOne({
        "productOffer.product": products.product._id,
        status: true,
        startingDate: { $lte: currentDate },
        endingDate: { $gte: currentDate },
      });
      
      const catOffers = await offerModel.findOne({
        "categoryOffer.category": products.product.product_category,
        status: true,
        startingDate: { $lte: currentDate },
        endingDate: { $gte: currentDate },
      });

      if (prodOffers && catOffers) {
        
        if (
          prodOffers.productOffer.discount >= catOffers.categoryOffer.discount
        ) {
          let discount =
            parseInt(products.product.product_discount) +
            parseInt(prodOffers.productOffer.discount);

          products.product.offerPrice = Math.round(
            products.product.product_price -
              (products.product.product_price * discount) / 100
          );
        } else {
          
          let discount =
            parseInt(products.product.product_discount) +
            parseInt(catOffers.categoryOffer.discount);
          

          products.product.offerPrice = Math.round(
            products.product.product_price -
              (products.product.product_price * discount) / 100
          );
          
        }
      } else if (prodOffers) {
        
        let discount =
          parseInt(products.product.product_discount) +
          parseInt(prodOffers.productOffer.discount);

        products.product.offerPrice = Math.round(
          products.product.product_price -
            (products.product.product_price * discount) / 100
        );
      } else if (catOffers) {
        let discount =
          parseInt(products.product.product_discount) +
          parseInt(catOffers.categoryOffer.discount);

        products.product.offerPrice = Math.round(
          products.product.product_price -
            (products.product.product_price * discount) / 100
        );
      } else {
        
        products.product.offerPrice = Math.round(
          products.product.product_price -
            (products.product.product_price *
              products.product.product_discount) /
              100
        );
      }
    }
    resolve(response);
  });
};

module.exports = {
  getAllWhishlistItems,
  addProductToWishlist,
  removeItem,
  checkWishlist,
  userWishlistCount,
  wishlistProductOfferCheck,
};
