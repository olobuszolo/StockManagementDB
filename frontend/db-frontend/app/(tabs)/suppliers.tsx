import { assignCategoryToSupplier, createSupplier, fetchCategoriesBySupplier, fetchSuppliers } from "@/api/suppliers";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BusinessEntity, BusinessEntityCreate } from "@/types/customers";
import { useEffect, useState } from "react";
import { FlatList, Button, TextInput, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Category, CategoryBySupplier } from "@/types/categories";
import { fetchCategories } from "@/api/categories";

export default function SuppliersScreen() {
    const [suppliers, setSuppliers] = useState<BusinessEntity[]>([]);
    const [form, setForm] = useState<BusinessEntityCreate>({
        name: "",
        email: "",
        nip: "",
    });
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
    const [categoriesBySupplier, setCategoriesBySupplier] = useState<CategoryBySupplier[]>([]);
    const [selectedAssignSupplierId, setSelectedAssignSupplierId] = useState<number | null>(null);
    const [selectedAssignCategoryId, setSelectedAssignCategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const handleFetchCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleFetchSuppliers = async () => {
        try {
            const data = await fetchSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const handleChange = (field: keyof BusinessEntityCreate, value: string) => {
        setForm((prevForm) => ({
            ...prevForm,
            [field]: value,
        }));
    }

    const handleCreateSupplier = async () => {
        try {            
            await createSupplier(form);
            setForm({ name: "", email: "", nip: "" });
        } catch (error) {
            console.error("Error creating supplier:", error);
        }
    };

    const handleFetchCategoriesBySupplier = async () => {
        if (!selectedSupplierId) {
            console.warn("No supplier selected");
            return;
        }
        try {
            const data = await fetchCategoriesBySupplier(selectedSupplierId);
            setCategoriesBySupplier(data);
        } catch (error) {
            console.error("Error fetching categories for supplier:", error);
        }
    }

    const handleAssignCategoryToSupplier = async () => {
        if (!selectedAssignSupplierId || !selectedAssignCategoryId) {
            console.warn("Supplier or category not selected");
            return;
        }
        try {
            await assignCategoryToSupplier(selectedAssignSupplierId, selectedAssignCategoryId);
            console.log("Category assigned successfully");
        } catch (error) {
            console.error("Error assigning category to supplier:", error);
        }
    }

    useEffect(() => {
        handleFetchSuppliers();
        handleFetchCategories();
    }, []);

    return (
        <ScrollView style={{ flex: 1 }}>
            <ThemedView style={{ paddingBottom: 40}}>
                <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Suppliers Screen</ThemedText>
                <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20}} />
                <Button title="Show all suppliers" onPress={handleFetchSuppliers} />
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Suppliers</ThemedText>
                <FlatList
                    data={suppliers}
                    keyExtractor={(item: BusinessEntity) => item.id.toString()}
                    renderItem={({ item }: { item: BusinessEntity }) => (
                        <ThemedView>
                            <ThemedText>{item.name} - {item.email} - {item.nip}</ThemedText>
                        </ThemedView>
                    )}
                />
                <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Create New Supplier</ThemedText>
                <TextInput
                    placeholder="Supplier Name"
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
                <Button title="Create Supplier" onPress={handleCreateSupplier} />
                <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Get Categories Served By Supplier</ThemedText>
                <Picker
                    selectedValue={selectedSupplierId}
                    onValueChange={(itemValue) => {
                        setSelectedSupplierId(itemValue)}}
                    style={{ color: "black" }}
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
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Categories Served By</ThemedText>
                <FlatList
                    data={categoriesBySupplier}
                    keyExtractor={(item: CategoryBySupplier) => item.category_id.toString()}
                    renderItem={({ item }) => (
                        <ThemedView>
                            <ThemedText>{item.category_name}</ThemedText>
                        </ThemedView>
                    )}
                />
                <Button title="Get Categories" onPress={handleFetchCategoriesBySupplier} />
                <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Assign Supplier To Category</ThemedText>
                <Picker
                    selectedValue={selectedAssignSupplierId}
                    onValueChange={(itemValue) => {
                        setSelectedAssignSupplierId(itemValue)}}
                    style={{ color: "black" }}
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
                <Picker
                    selectedValue={selectedAssignCategoryId}
                    onValueChange={(itemValue) => {
                        setSelectedAssignCategoryId(itemValue)}}
                    style={{ color: "black" }}
                >
                    <Picker.Item label="Select category..." value={null} color="gray" />
                    {categories.map((category) => (
                        <Picker.Item
                            key={category.id}
                            label={category.name}
                            value={category.id}
                        />
                    ))}
                </Picker>
            </ThemedView>
            <Button title="Assign Category" onPress={handleAssignCategoryToSupplier} />
        </ScrollView>
    )
}