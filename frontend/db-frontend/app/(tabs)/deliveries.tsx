// import { ThemedText } from "@/components/themed-text";
// import { useEffect, useState } from "react";
// import { FlatList, Button, TextInput, View, ScrollView } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { BusinessEntity } from "@/types/customers";
// import { fetchDeliveries } from "@/api/deliveries";

// export default function DeliveriesScreen() {
//     const [deliveries, setDeliveries] = useState([]);

//     const [form, setForm] = useState({

//     })

//     const handleFetchDeliveries = async () => {
//         try {
//             const response = await fetchDeliveries();
//             setDeliveries(response);
//         } catch (error) {
//             console.error("Error fetching deliveries:", error);
//         }
//     }

//     const handleCreateDelivery = async () => {
//         try {
//             await handleCreateDelivery(form);
//         } catch (error) {
//             console.error("Error creating delivery:", error);
//         }
//     };
        
//     return (
//         <ScrollView style={{ flex: 1 }}>
//             <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Deliveries Screen</ThemedText>
//             <View style={{ height: 5, backgroundColor: 'white', marginVertical: 20 }} />
//             <Button title="Show all deliveries" onPress={handleFetchDeliveries} />
//             <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Deliveries</ThemedText>

//             <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
//             <Button title="Create Delivery" onPress={handleCreateDelivery} />
//             <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Deliveries</ThemedText>
            
//         </ScrollView>
//     )
// }


import { ThemedText } from "@/components/themed-text";
import { useEffect, useState } from "react";
import { FlatList, Button, TextInput, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { fetchDeliveries, createDelivery } from "@/api/deliveries";
import { fetchProducts } from "@/api/products";
import { fetchSuppliers } from "@/api/suppliers";
import { Product } from "@/types/products";
import { BusinessEntity } from "@/types/customers";

type DeliveryItemCreate = {
    product_id: number;
    quantity: number;
    unit_price: number;
};

type DeliveryItem = {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
};

type Delivery = {
    id: number;
    supplier_name: string;
    order_date: string;
    status: string;
    items: DeliveryItem[];
};

export default function DeliveriesScreen() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [showAllDeliveries, setShowAllDeliveries] = useState(false);

    const [suppliers, setSuppliers] = useState<BusinessEntity[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [deliveryItems, setDeliveryItems] = useState<
        { product_id: number; quantity: number; unit_price: number }[]
    >([]);

    const handleFetchDeliveries = async () => {
        try {
            const response = await fetchDeliveries();
            setDeliveries(response);
        } catch (error) {
            console.error("Error fetching deliveries:", error);
        }
    };

    const handleFetchSuppliers = async () => {
        try {
            const response = await fetchSuppliers();
            setSuppliers(response);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const handleFetchProducts = async () => {
        try {
            const response = await fetchProducts();
            setProducts(response);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleAddItem = () => {
        const parsedQuantity = Number(quantity);
        const parsedUnitPrice = Number(unitPrice);

        if (selectedProductId === null) {
            console.warn("Select product");
            return;
        }

        if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
            console.warn("Quantity must be > 0");
            return;
        }

        if (Number.isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
            console.warn("Unit price must be >= 0");
            return;
        }

        setDeliveryItems((prev) => [
            ...prev,
            {
                product_id: selectedProductId,
                quantity: parsedQuantity,
                unit_price: parsedUnitPrice,
            },
        ]);

        setSelectedProductId(null);
        setQuantity("");
        setUnitPrice("");
    };

    const handleCreateDelivery = async () => {
        if (selectedSupplierId === null) {
            console.warn("Select supplier");
            return;
        }

        if (deliveryItems.length === 0) {
            console.warn("Add at least one item");
            return;
        }

        try {
            const payload = {
                supplier_id: selectedSupplierId,
                items: deliveryItems,
            };

            await createDelivery(payload);
            console.log("Delivery created");

            setSelectedSupplierId(null);
            setDeliveryItems([]);
            setQuantity("");
            setUnitPrice("");
            setSelectedProductId(null);

            await handleFetchDeliveries();
        } catch (error) {
            console.error("Error creating delivery:", error);
        }
    };

    const getProductNameById = (productId: number) => {
        const product = products.find((item) => item.id === productId);
        return product ? product.name : `Product ID: ${productId}`;
    };

    useEffect(() => {
        handleFetchDeliveries();
        handleFetchSuppliers();
        handleFetchProducts();
    }, []);

    return (
    <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
        <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
            Deliveries Screen
        </ThemedText>

        <View style={{ height: 5, backgroundColor: "white", marginVertical: 20 }} />

        <Button
            title={showAllDeliveries ? "Hide all deliveries" : "Show all deliveries"}
            onPress={() => setShowAllDeliveries(!showAllDeliveries)}
        />

        {showAllDeliveries && (
            <>
                <ThemedText style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
                    All Deliveries
                </ThemedText>

                {deliveries.map((item) => (
                    <View key={item.id}>
                        <View
                            style={{ height: 1, backgroundColor: "gray", marginVertical: 10 }}
                        />
                        <ThemedText>Supplier name: {item.supplier_name}</ThemedText>
                        <ThemedText>Order date: {item.order_date}</ThemedText>
                        <ThemedText>Status: {item.status}</ThemedText>

                        <ThemedText style={{ fontWeight: "bold", marginTop: 8 }}>
                            Items:
                        </ThemedText>

                        {item.items.map((deliveryItem, index) => (
                            <View key={index} style={{ marginLeft: 20, marginTop: 4 }}>
                                <ThemedText>
                                    Product name: {deliveryItem.product_name}
                                </ThemedText>
                                <ThemedText>
                                    Quantity: {deliveryItem.quantity}
                                </ThemedText>
                                <ThemedText>
                                    Unit price: {deliveryItem.unit_price}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                ))}
            </>
        )}

        <View style={{ height: 1, backgroundColor: "white", marginVertical: 20 }} />

        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
            Create New Delivery
        </ThemedText>

        <ThemedText style={{ fontWeight: "bold", marginTop: 10 }}>
            Select supplier
        </ThemedText>
        <Picker
            selectedValue={selectedSupplierId}
            onValueChange={(itemValue) =>
                setSelectedSupplierId(itemValue === null ? null : Number(itemValue))
            }
            style={{ color: "black", backgroundColor: "white" }}
        >
            <Picker.Item label="Select supplier..." value={null} color="gray" />
            {suppliers.map((supplier) => (
                <Picker.Item
                    key={supplier.id}
                    label={supplier.name}
                    value={supplier.id}
                />
            ))}
        </Picker>

        <ThemedText style={{ fontWeight: "bold", marginTop: 10 }}>
            Select product
        </ThemedText>
        <Picker
            selectedValue={selectedProductId}
            onValueChange={(itemValue) =>
                setSelectedProductId(itemValue === null ? null : Number(itemValue))
            }
            style={{ color: "black", backgroundColor: "white" }}
        >
            <Picker.Item label="Select product..." value={null} color="gray" />
            {products.map((product) => (
                <Picker.Item
                    key={product.id}
                    label={product.name}
                    value={product.id}
                />
            ))}
        </Picker>

        <TextInput
            placeholder="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={{
                borderWidth: 1,
                borderColor: "gray",
                padding: 10,
                marginTop: 10,
                borderRadius: 8,
                backgroundColor: "white",
            }}
        />

        <TextInput
            placeholder="Unit Price"
            value={unitPrice}
            onChangeText={setUnitPrice}
            keyboardType="numeric"
            style={{
                borderWidth: 1,
                borderColor: "gray",
                padding: 10,
                marginTop: 10,
                borderRadius: 8,
                backgroundColor: "white",
            }}
        />

        <View style={{ marginTop: 10 }}>
            <Button title="Add item" onPress={handleAddItem} />
        </View>

        {deliveryItems.length > 0 && (
            <View style={{ marginTop: 16 }}>
                <ThemedText style={{ fontWeight: "bold" }}>
                    Added items:
                </ThemedText>

                {deliveryItems.map((item, index) => (
                    <View key={index} style={{ marginTop: 8 }}>
                        <ThemedText>
                            {getProductNameById(item.product_id)} - {item.quantity} - {item.unit_price}
                        </ThemedText>
                    </View>
                ))}
            </View>
        )}

        <View style={{ marginTop: 16 }}>
            <Button title="Create delivery" onPress={handleCreateDelivery} />
        </View>
    </ScrollView>
);
}