import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { createEmployee, fetchEmployees } from "@/api/employees";
import { useState } from "react";
import { FlatList, Button, TextInput, View } from "react-native";

type Employee = {
    id: number;
    name: string;
    email: string;
}

export default function EmployeesScreen() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleCreateEmployee = async () => {
        try {
            await createEmployee({ name, email });
            setName("");
            setEmail("");
        } catch (error) {
            console.error("Error creating employee:", error);
        }
    };

    const handleFetchEmployees = async () => {
        try {
            const data = await fetchEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }

    return (
        <ThemedView>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Employees Screen</ThemedText>
            <Button title="Show all employees" onPress={handleFetchEmployees} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>All Employees</ThemedText>
            <FlatList
                data={employees}
                keyExtractor={(item: Employee) => item.id.toString()}
                renderItem={({ item }: { item: Employee }) => (
                    <ThemedView>
                        <ThemedText>{item.name} - {item.email}</ThemedText>
                    </ThemedView>
                )}
            />
            <View style={{ height: 1, backgroundColor: 'white', marginVertical: 20 }} />
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>Create New Employee</ThemedText>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={{color: 'white'}}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={{color: 'white'}}
            />
            <Button title="Create Employee" onPress={handleCreateEmployee} />
        </ThemedView>
    );
}