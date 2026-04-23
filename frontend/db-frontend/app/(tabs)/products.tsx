import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Button, TextInput, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Product, ProductCreate, ProductNewestPrice } from "@/types/products";
import { Category } from "@/types/categories";
import { Unit } from "@/types/units";
import { fetchCategories } from "@/api/categories";
import { fetchUnits } from "@/api/units";
import { createProduct, fetchNewestProductPrices, fetchProducts } from "@/api/products";

export default function ProductsScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [newestProductPrices, setNewestProductPrices] = useState<ProductNewestPrice[]>([]);
    const [selectedPriceProductId, setSelectedPriceProductId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [form, setForm] = useState<ProductCreate>({
        name: "",
        description: "",
        quantity: 0,
        unit_name: "",
        category_name: ""
    });

    const handleChange = (field: keyof ProductCreate, value: string | number) => {
        setForm((prevForm) => ({
            ...prevForm,
            [field]: value,
        }));
    }

    const handleFetchUnits = async () => {
        try {
            const data = await fetchUnits();
            setUnits(data);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };
            
    const handleFetchCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    useEffect(() => {
        handleFetchUnits();
        handleFetchCategories();
        handleFetchProducts();
        handleFetchNewestProductPrices();
    }, []);

    const handleFetchProducts = async () => {
        try {
            const response = await fetchProducts();
            setProducts(response);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    const handleFetchNewestProductPrices = async () => {
        try {
            const response = await fetchNewestProductPrices();
            setNewestProductPrices(response);
        } catch (error) {
            console.error("Error fetching newest product prices:", error);
        }
    }

    const handleCreateProduct = async () => {
        try {
            await createProduct(form);
            setForm({
                name: "",
                description: "",
                quantity: 0,
                unit_name: "",
                category_name: ""
            });
            handleFetchProducts();
            handleFetchNewestProductPrices();
        } catch (error) {
            console.error("Error creating product:", error);
        }
    };

    const selectedProductPrice = useMemo(
        () => newestProductPrices.find((item) => item.product_id === selectedPriceProductId),
        [newestProductPrices, selectedPriceProductId]
    );

    return (
        <ScrollView style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Products Screen</ThemedText>
            <View style={{ height: 5, backgroundColor: 'white', marginVertical: 20 }} />
            <Button title="Show all products" onPress={handleFetchProducts} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Products</ThemedText>
            <FlatList
                data={products}
                keyExtractor={(item: Product) => item.id.toString()}
                renderItem={({ item }: { item: Product }) => (
                    <ThemedView>
                        <ThemedText>{item.name} - {item.description} - {item.quantity} - {item.unit_name}</ThemedText>
                    </ThemedView>
                )}
            />
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Newest Product Price</ThemedText>
            <Picker
                selectedValue={selectedPriceProductId}
                onValueChange={(value) =>
                    setSelectedPriceProductId(value === null ? null : Number(value))
                }
            >
                <Picker.Item label="Select Product" value={null} />
                {products.map((product) => (
                    <Picker.Item key={product.id} label={product.name} value={product.id} />
                ))}
            </Picker>
            {selectedPriceProductId !== null && (
                <ThemedText>
                    {selectedProductPrice?.newest_price !== null && selectedProductPrice?.newest_price !== undefined
                        ? `Newest price: ${selectedProductPrice.newest_price}`
                        : "This product does not have a delivery price yet."}
                </ThemedText>
            )}
            <View style={{ marginTop: 10 }}>
                <Button title="Refresh newest prices" onPress={handleFetchNewestProductPrices} />
            </View>

            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Create New Product</ThemedText>
            <TextInput
                placeholder="Product Name"
                placeholderTextColor="gray"
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                style={{color: 'white'}}
            />
            <TextInput
                placeholder="Product Description"
                placeholderTextColor="gray"
                value={form.description}
                onChangeText={(text) => handleChange("description", text)}
                style={{color: 'white'}}
            />
            <TextInput
                placeholder="Product Quantity"
                placeholderTextColor="gray"
                value={form.quantity.toString()}
                onChangeText={(text) => handleChange("quantity", parseFloat(text) || 0)}
                keyboardType="numeric"
                style={{color: 'white'}}
            />
            <Picker
                selectedValue={form.unit_name}
                onValueChange={(value) => handleChange("unit_name", value)}
            >
                <Picker.Item label="Select Unit" value="" />
                {units.map((unit) => (
                    <Picker.Item key={unit.id} label={unit.name} value={unit.name} />
                ))}
            </Picker>
            <Picker
                selectedValue={form.category_name}
                onValueChange={(value) => handleChange("category_name", value)}
            >
                <Picker.Item label="Select Category" value="" />
                {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.name} />
                ))}
            </Picker>
            <Button title="Create Product" onPress={handleCreateProduct} />


        </ScrollView>
    )
}
