import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import { FlatList, Button, TextInput, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { fetchOrders, fetchOrdersByCustomer } from "@/api/orders";
import { Order } from "@/types/orders";
import { fetchCustomers } from "@/api/customers";
import { BusinessEntity } from "@/types/customers";


export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<BusinessEntity[]>([]);
    const [showAllOrders, setShowAllOrders] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [showOrdersByCustomer, setShowOrdersByCustomer] = useState(false);
    const [ordersByCustomer, setOrdersByCustomer] = useState<Order[]>([]);

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
            

    useEffect(() => {
        handleFetchOrders();
        handleFetchCustomers();
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
        </ScrollView>

    )
}