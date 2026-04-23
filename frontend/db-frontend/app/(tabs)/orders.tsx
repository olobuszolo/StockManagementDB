import { ThemedText } from "@/components/themed-text";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Button, TextInput, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createOrder, fetchIncompleteOrders, fetchOrders, fetchOrdersByCustomer, updateOrderCompletionDate } from "@/api/orders";
import { IncompleteOrder, Order, OrderItemCreate } from "@/types/orders";
import { fetchCustomers } from "@/api/customers";
import { BusinessEntity } from "@/types/customers";
import { fetchEmployees } from "@/api/employees";
import { Product } from "@/types/products";
import { fetchProducts } from "@/api/products";
import { useFocusEffect } from "@react-navigation/native";


export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [incompleteOrders, setIncompleteOrders] = useState<IncompleteOrder[]>([]);
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
    const [orderFormKey, setOrderFormKey] = useState(0);
    const [selectedPendingOrderId, setSelectedPendingOrderId] = useState<number | null>(null);
    const [completionDate, setCompletionDate] = useState("");

    const resetOrderForm = () => {
        setSelectedEmployeeId(null);
        setNewOrderCustomerId(null);
        setSelectedProductName(null);
        setQuantity("");
        setUnitPrice("");
        setOrderItems([]);
        setOrderFormKey((prev) => prev + 1);
    };

    const handleFetchOrders = async () => {
        try {
            const response = await fetchOrders();
            setOrders(response);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const handleFetchIncompleteOrders = async () => {
        try {
            const response = await fetchIncompleteOrders();
            setIncompleteOrders(response);
        } catch (error) {
            console.error("Error fetching incomplete orders:", error);
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
        const parsedUnitPrice = Number(unitPrice);

        if (!selectedProductName) {
            console.warn("Select product");
            return;
        }

        if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
            console.warn("Quantity must be > 0");
            return;
        }

        if (Number.isNaN(parsedUnitPrice) || parsedUnitPrice <= 0) {
            console.warn("Unit price must be > 0");
            return;
        }

        setOrderItems((prev) => [
            ...prev,
            {
                product_name: selectedProductName,
                quantity: parsedQuantity,
                unit_price: parsedUnitPrice,
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
            resetOrderForm();
            handleFetchProducts();

            console.log("Order created:", createdOrder);
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const handleCompleteOrder = async () => {
        if (selectedPendingOrderId === null) {
            console.warn("Select pending order");
            return;
        }

        try {
            const payload = completionDate.trim()
                ? { completion_date: completionDate.trim() }
                : {};

            await updateOrderCompletionDate(selectedPendingOrderId, payload);

            setSelectedPendingOrderId(null);
            setCompletionDate("");

            await handleFetchOrders();
            await handleFetchIncompleteOrders();

            if (showOrdersByCustomer && selectedCustomerId !== null) {
                await loadOrdersByCustomer(selectedCustomerId);
            }
        } catch (error) {
            console.error("Error updating order completion date:", error);
        }
    };
            
    useFocusEffect(
        useCallback(() => {
            handleFetchOrders();
            handleFetchIncompleteOrders();
            handleFetchCustomers();
            handleFetchEmployees();
            handleFetchProducts();
        }, [])
    );
    const selectedProductUnitName = useMemo(
        () => products.find((product) => product.name === selectedProductName)?.unit_name,
        [products, selectedProductName]
    );


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
                            <ThemedText>Order ID: {item.id}</ThemedText>
                            <ThemedText>Employee name: {item.employee_name}</ThemedText>
                            <ThemedText>Customer name: {item.customer_name}</ThemedText>
                            <ThemedText>Order date: {item.order_date}</ThemedText>
                            <ThemedText>Deadline date: {item.deadline_date}</ThemedText>
                            <ThemedText>Completion date: {item.completion_date ?? "Not completed"}</ThemedText>
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
                            <ThemedText>Order ID: {item.id}</ThemedText>
                            <ThemedText>Employee name: {item.employee_name}</ThemedText>
                            <ThemedText>Order date: {item.order_date}</ThemedText>
                            <ThemedText>Deadline date: {item.deadline_date}</ThemedText>
                            <ThemedText>Completion date: {item.completion_date ?? "Not completed"}</ThemedText>
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
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Complete Pending Order</ThemedText>
            {incompleteOrders.length > 0 && (
                <View style={{ marginTop: 12 }}>
                    <ThemedText style={{ fontWeight: 'bold' }}>Pending orders:</ThemedText>
                    {incompleteOrders.map((order) => (
                        <View key={order.id} style={{ marginTop: 8 }}>
                            <ThemedText>
                                #{order.id} - {order.customer_name} - ordered: {order.order_date}
                            </ThemedText>
                        </View>
                    ))}
                </View>
            )}
            <ThemedText style={{ fontWeight: "bold", marginTop: 10 }}>Select pending order</ThemedText>
            <Picker
                selectedValue={selectedPendingOrderId}
                onValueChange={(itemValue) =>
                    setSelectedPendingOrderId(itemValue === null ? null : Number(itemValue))
                }
                style={{ color: "black", backgroundColor: "white" }}
            >
                <Picker.Item label="Select pending order..." value={null} color="gray" />
                {incompleteOrders.map((order) => (
                    <Picker.Item
                        key={order.id}
                        label={`${order.id} - ${order.customer_name}`}
                        value={order.id}
                    />
                ))}
            </Picker>
            <TextInput
                placeholder="Completion date optional (YYYY-MM-DD HH:MM:SS)"
                value={completionDate}
                onChangeText={setCompletionDate}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 10,
                    marginTop: 10,
                    borderRadius: 8,
                    backgroundColor: "white",
                }}
            />
            <View style={{ marginTop: 12 }}>
                <Button title="Complete order" onPress={handleCompleteOrder} />
            </View>

            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <View key={orderFormKey}>
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
                    placeholder={selectedProductUnitName ? `Quantity (${selectedProductUnitName})` : "Quantity"}
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
                            {item.product_name} - {item.quantity} - {item.unit_price}
                        </ThemedText>
                    </View>
                ))}

                <View style={{ marginTop: 12 }}>
                    <Button title="Create order" onPress={handleCreateOrder} />
                </View>

                <View style={{ marginTop: 12, marginBottom: 24 }}>
                    <Button title="Cancel creating order" onPress={resetOrderForm} color="#b22222" />
                </View>
            </View>
        </ScrollView>

    )
}
