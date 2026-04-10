import { ThemedText } from "@/components/themed-text";
import { useEffect, useState } from "react";
import { FlatList, Button, TextInput, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createOrder, fetchOrders, fetchOrdersByCustomer } from "@/api/orders";
import { Order, OrderItemCreate } from "@/types/orders";
import { fetchCustomers } from "@/api/customers";
import { BusinessEntity } from "@/types/customers";
import { fetchEmployees } from "@/api/employees";
import { Product } from "@/types/products";
import { fetchProducts } from "@/api/products";


export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<BusinessEntity[]>([]);
    const [employees, setEmployees] = useState<BusinessEntity[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [showAllOrders, setShowAllOrders] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [showOrdersByCustomer, setShowOrdersByCustomer] = useState(false);
    const [ordersByCustomer, setOrdersByCustomer] = useState<Order[]>([]);

    const [unitPrice, setUnitPrice] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [newOrderCustomerId, setNewOrderCustomerId] = useState<number | null>(null);
    const [selectedProductName, setSelectedProductName] = useState<string | null>(null);    
    const [quantity, setQuantity] = useState("");
    const [orderItems, setOrderItems] = useState<OrderItemCreate[]>([]);

    const handleFetchOrders = async () => {
        try {
            const response = await fetchOrders();
            setOrders(response);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const loadOrdersByCustomer = async (customerId: number) => {
        try {
            const response = await fetchOrdersByCustomer(customerId);
            setOrdersByCustomer(response);
            setShowOrdersByCustomer(true);
        } catch (error) {
            console.error("Error fetching orders by customer:", error);
        }
    };

    const handleFetchOrdersByCustomer = async () => {
        if (showOrdersByCustomer) {
            setShowOrdersByCustomer(false);
            return;
        }

        if (selectedCustomerId === null) {
            console.warn("No customer selected");
            return;
        }

        await loadOrdersByCustomer(selectedCustomerId);
    };

    const handleFetchCustomers = async () => {
        try {
            const response = await fetchCustomers();
            setCustomers(response);
        } catch (error) {
            console.error("Error fetching customers:", error);
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

    const handleFetchEmployees = async () => {
        try {
            const response = await fetchEmployees();
            setEmployees(response);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleAddItem = () => {
        const parsedQuantity = Number(quantity);

        if (!selectedProductName) {
            console.warn("Select product");
            return;
        }

        if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
            console.warn("Quantity must be > 0");
            return;
        }

        setOrderItems((prev) => [
            ...prev,
            {
                product_name: selectedProductName,
                quantity: parsedQuantity,
                unit_price: Number(unitPrice),
            },
        ]);

        setSelectedProductName(null);
        setQuantity("");
        setUnitPrice("");
    };

    const handleCreateOrder = async () => {
        if (selectedEmployeeId === null) {
            console.warn("Select employee");
            return;
        }

        if (newOrderCustomerId === null) {
            console.warn("Select customer");
            return;
        }

        if (orderItems.length === 0) {
            console.warn("Add at least one item");
            return;
        }

        try {
            const payload = {
                employee_id: selectedEmployeeId,
                customer_id: newOrderCustomerId,
                items: orderItems,
            };

            const createdOrder = await createOrder(payload);

            setOrders((prev) => [createdOrder, ...prev]);
            setOrderItems([]);
            setSelectedEmployeeId(null);
            setNewOrderCustomerId(null);

            console.log("Order created:", createdOrder);
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };
            

    useEffect(() => {
        handleFetchOrders();
        handleFetchCustomers();
        handleFetchEmployees();
        handleFetchProducts();
    }, []);


    return (
        <ScrollView style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Orders Screen</ThemedText>
            <View style={{ height: 5, backgroundColor: 'white', marginVertical: 20 }} />
            <Button 
                title={showAllOrders ? "Hide all orders" : "Show all orders"}
                onPress={() => setShowAllOrders(!showAllOrders)}
            />
            {showAllOrders && (
                <><ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Orders</ThemedText>
                <FlatList
                    data={orders}
                    keyExtractor={(item: Order) => item.id.toString()}
                    renderItem={({ item }: { item: Order; }) => (
                        <View>
                            <View style={{ height: 1, backgroundColor: 'gray', marginVertical: 5 }} />
                            <ThemedText>Employee name: {item.employee_name}</ThemedText>
                            <ThemedText>Customer name: {item.customer_name}</ThemedText>
                            <ThemedText>Order date: {item.order_date}</ThemedText>
                            <ThemedText>Deadline date: {item.deadline_date}</ThemedText>
                            <ThemedText>Status: {item.status}</ThemedText>
                            <ThemedText style={{ fontWeight: 'bold' }}>Items:</ThemedText>
                            {item.items.map((orderItem, index) => (
                                <View key={index} style={{ marginLeft: 20 }}>
                                    <ThemedText>Product name: {orderItem.product_name}</ThemedText>
                                    <ThemedText>Unit price: {orderItem.unit_price}</ThemedText>
                                    <ThemedText>Quantity: {orderItem.quantity} {orderItem.unit_name}</ThemedText>
                                </View>
                            ))}
                        </View>
                )} /></>
            )}
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Orders By Customer</ThemedText>
            <Picker
                selectedValue={selectedCustomerId}
                onValueChange={(itemValue) => {
                    if (itemValue === null) {
                        setSelectedCustomerId(null);
                        setShowOrdersByCustomer(false);
                        setOrdersByCustomer([]);
                        return;
                    }

                    const customerId = Number(itemValue);
                    setSelectedCustomerId(customerId);

                    if (showOrdersByCustomer) {
                        loadOrdersByCustomer(customerId);
                    }
                }}
                style={{ color: "black" }}
            >
                <Picker.Item label="Select customer..." value={null} color="gray" />
                {customers.map((customer: BusinessEntity) => (
                    <Picker.Item
                        key={customer.id}
                        label={customer.name}
                        value={customer.id}
                    />
                ))}
            </Picker>
                {showOrdersByCustomer && (
                    <FlatList
                        data={ordersByCustomer}
                        keyExtractor={(item: Order) => item.id.toString()}
                        renderItem={({ item }: { item: Order; }) => (
                            <View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginVertical: 5 }} />
                            <ThemedText>Employee name: {item.employee_name}</ThemedText>
                            <ThemedText>Order date: {item.order_date}</ThemedText>
                            <ThemedText>Deadline date: {item.deadline_date}</ThemedText>
                            <ThemedText>Status: {item.status}</ThemedText>
                            <ThemedText style={{ fontWeight: 'bold' }}>Items:</ThemedText>
                            {item.items.map((orderItem, index) => (
                                <View key={index} style={{ marginLeft: 20 }}>
                                    <ThemedText>Product name: {orderItem.product_name}</ThemedText>
                                    <ThemedText>Quantity: {orderItem.quantity} {orderItem.unit_name}</ThemedText>
                                    <ThemedText>Unit price: {orderItem.unit_price}</ThemedText>
                                </View>
                            ))}
                        </View>
                )} />
            )}
            <Button
                title={showOrdersByCustomer ? "Hide Orders By Customer" : "Show Orders By Customer"}
                onPress={handleFetchOrdersByCustomer}
            />
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Create New Order</ThemedText>
            <ThemedText style={{ fontWeight: "bold", marginTop: 10 }}>Select employee</ThemedText>
            <Picker
                selectedValue={selectedEmployeeId}
                onValueChange={(itemValue) => setSelectedEmployeeId(itemValue === null ? null : Number(itemValue))}
                style={{ color: "black" }}
            >
                <Picker.Item label="Select employee..." value={null} color="gray" />
                {employees.map((employee: BusinessEntity) => (
                    <Picker.Item
                        key={employee.id}
                        label={employee.name}
                        value={employee.id}
                    />
                ))}
            </Picker>

            <ThemedText style={{ fontWeight: "bold", marginTop: 10 }}>Select customer</ThemedText>
            <Picker
                selectedValue={newOrderCustomerId}
                onValueChange={(itemValue) => setNewOrderCustomerId(itemValue === null ? null : Number(itemValue))}
                style={{ color: "black" }}
            >
                <Picker.Item label="Select customer..." value={null} color="gray" />
                {customers.map((customer: BusinessEntity) => (
                    <Picker.Item
                        key={customer.id}
                        label={customer.name}
                        value={customer.id}
                    />
                ))}
            </Picker>

            <ThemedText style={{ fontWeight: "bold", marginTop: 10 }}>
                Select product
            </ThemedText>

            <Picker
                selectedValue={selectedProductName}
                onValueChange={(itemValue) =>
                    setSelectedProductName(itemValue === null ? null : String(itemValue))
                }
                style={{ color: "black" }}
            >
                <Picker.Item label="Select product..." value={null} color="gray" />
                {products.map((product) => (
                    <Picker.Item
                        key={product.id}
                        label={product.name}
                        value={product.name}
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

            <Button title="Add item" onPress={handleAddItem} />

            {orderItems.map((item, index) => (
                <View key={index} style={{ marginTop: 8 }}>
                    <ThemedText>
                        {item.product_name} - {item.quantity}
                    </ThemedText>
                </View>
            ))}

            <View style={{ marginTop: 12 }}>
                <Button title="Create order" onPress={handleCreateOrder} />
            </View>
        </ScrollView>

    )
}