import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import { FlatList, Button, TextInput, View } from "react-native";
import { createCustomer, fetchCustomers } from "@/api/customers";
import { BusinessEntity, BusinessEntityCreate } from "@/types/customers";

export default function CustomersScreen() {
    const [customers, setCustomers] = useState<BusinessEntity[]>([]);
    const [form, setForm] = useState<BusinessEntityCreate>({
        name: "",
        email: "",
        nip: "",
    });

    const handleFetchCustomers = async () => {
        try {
            const data = await fetchCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    }

    const handleChange = (field: keyof BusinessEntityCreate, value: string) => {
        setForm((prevForm) => ({
            ...prevForm,
            [field]: value,
        }));
    }

    const handleCreateCustomer = async () => {
        try {            
            await createCustomer(form);
            setForm({ name: "", email: "", nip: "" });
        } catch (error) {
            console.error("Error creating customer:", error);
        }
    };


    return (
        <ThemedView>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Customers Screen</ThemedText>
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20}} />
            <Button title="Show all customers" onPress={handleFetchCustomers} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Customers</ThemedText>
            <FlatList
                data={customers}
                keyExtractor={(item: BusinessEntity) => item.id.toString()}
                renderItem={({ item }: { item: BusinessEntity }) => (
                    <ThemedView>
                        <ThemedText>{item.name} - {item.email} - {item.nip}</ThemedText>
                    </ThemedView>
                )}
            />
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Create New Customer</ThemedText>
            <TextInput
                placeholder="Customer Name"
                placeholderTextColor="gray"
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                style={{color: 'white'}}
            />
            <TextInput
                placeholder="Email"
                placeholderTextColor="gray"
                value={form.email}
                onChangeText={(text) => handleChange("email", text)}
                style={{color: 'white'}}
            />
            <TextInput
                placeholder="NIP"
                placeholderTextColor="gray"
                value={form.nip}
                onChangeText={(text) => handleChange("nip", text)}
                style={{color: 'white'}}
            />
            <Button title="Create Customer" onPress={handleCreateCustomer} />
        </ThemedView>
    )
}