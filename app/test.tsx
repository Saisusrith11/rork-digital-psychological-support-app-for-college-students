import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TestScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Test API calls
  const exampleQuery = useQuery({
    queryKey: ['example'],
    queryFn: () => apiClient.getExample(),
  });

  const resourcesQuery = useQuery({
    queryKey: ['resources'],
    queryFn: () => apiClient.getResources(),
  });

  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: () => apiClient.getStudents(),
  });

  const createResourceMutation = useMutation({
    mutationFn: (data: any) => apiClient.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const handleCreateResource = () => {
    createResourceMutation.mutate({
      title: 'Test Resource',
      description: 'This is a test resource',
      type: 'pdf',
      category: 'Test',
      fileUrl: 'https://example.com/test.pdf',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>API Test Screen</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example API</Text>
          <Text style={styles.status}>
            Status: {exampleQuery.isLoading ? 'Loading...' : exampleQuery.error ? 'Error' : 'Success'}
          </Text>
          {exampleQuery.data ? (
            <Text style={styles.data}>
              Data: {JSON.stringify(exampleQuery.data, null, 2) || 'No data'}
            </Text>
          ) : null}
          {exampleQuery.error && (
            <Text style={styles.error}>
              Error: {String(exampleQuery.error)}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources API</Text>
          <Text style={styles.status}>
            Status: {resourcesQuery.isLoading ? 'Loading...' : resourcesQuery.error ? 'Error' : 'Success'}
          </Text>
          {resourcesQuery.data ? (
            <Text style={styles.data}>
              Data: {JSON.stringify(resourcesQuery.data, null, 2) || 'No data'}
            </Text>
          ) : null}
          {resourcesQuery.error && (
            <Text style={styles.error}>
              Error: {String(resourcesQuery.error)}
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCreateResource}
            disabled={createResourceMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createResourceMutation.isPending ? 'Creating...' : 'Create Test Resource'}
            </Text>
          </TouchableOpacity>
          
          {createResourceMutation.error && (
            <Text style={styles.error}>
              Create Error: {String(createResourceMutation.error)}
            </Text>
          )}
          
          {createResourceMutation.data ? (
            <Text style={styles.success}>
              Created: {JSON.stringify(createResourceMutation.data, null, 2) || 'No data'}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Students API</Text>
          <Text style={styles.status}>
            Status: {studentsQuery.isLoading ? 'Loading...' : studentsQuery.error ? 'Error' : 'Success'}
          </Text>
          {studentsQuery.data ? (
            <Text style={styles.data}>
              Data: {JSON.stringify(studentsQuery.data, null, 2) || 'No data'}
            </Text>
          ) : null}
          {studentsQuery.error && (
            <Text style={styles.error}>
              Error: {String(studentsQuery.error)}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={() => queryClient.invalidateQueries()}
        >
          <Text style={styles.buttonText}>Refresh All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  data: {
    fontSize: 12,
    color: Colors.text.primary,
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 8,
  },
  success: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: Colors.surface,
    fontWeight: '600',
  },
});