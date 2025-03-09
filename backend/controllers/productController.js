export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
    });

export const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
    });
});

