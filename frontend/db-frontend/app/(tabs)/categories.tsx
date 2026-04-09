import { createCategory, fetchCategories } from "@/api/categories";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Category } from "@/types/categories";
import { useState } from "react";
import { Button, FlatList, TextInput, View } from "react-native";


export default function CategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleFetchCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    const handleCreateCategory = async () => {
        try {
            await createCategory(newCategoryName);
            setNewCategoryName('');
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };


    return (
        <ThemedView>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Categories Screen</ThemedText>
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20}} />
            <Button title="Show all categories" onPress={handleFetchCategories} />
            <FlatList
                data={categories}
                keyExtractor={(item: Category) => item.id.toString()}
                renderItem={({ item }: { item: Category }) => (
                    <ThemedView>
                        <ThemedText>{item.name}</ThemedText>
                    </ThemedView>
                )}
            />
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Create New Category</ThemedText>
            <TextInput
                placeholder="Category Name"
                placeholderTextColor="gray"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={{color: 'white'}}
            />
            <Button title="Create Category" onPress={handleCreateCategory} />
        </ThemedView>
    )
}