"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { 
  createEvent, 
  getEvents, 
  attendEvent, 
  unattendEvent 
} from "../../services/eventService"
import { useAuth } from "../../context/AuthContext"
import type { Event } from "../../types"

export default function EventsScreen() {
  const { user } = useAuth()
  const [modalVisible, setModalVisible] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventDate, setEventDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const fetchedEvents = await getEvents()
      setEvents(fetchedEvents)
    } catch (error) {
      Alert.alert("Error", "Failed to load events")
    }
  }

  const handleCreateEvent = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create an event")
      return
    }

    if (!eventTitle.trim() || !eventDescription.trim() || !eventLocation.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await createEvent({
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        date: eventDate,
        location: eventLocation.trim(),
        organizerId: user.id
      })

      // Clear form and close modal
      setModalVisible(false)
      setEventTitle("")
      setEventDescription("")
      setEventLocation("")
      setEventDate(new Date())
      
      // Reload events to show the new one
      await loadEvents()
      
      Alert.alert("Success", "Event created successfully!")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendEvent = async (event: Event) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to attend events")
      return
    }

    try {
      const isAttending = event.attendees.includes(user.id)
      
      if (isAttending) {
        await unattendEvent(event.id, user.id)
      } else {
        await attendEvent(event.id, user.id)
      }

      // Reload events to get the updated data
      await loadEvents()
      
      Alert.alert(
        "Success", 
        isAttending ? "Removed from event" : "Added to event!"
      )
    } catch (error) {
      Alert.alert("Error", "Failed to update attendance")
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleDateChange = (value: string) => {
    const newDate = new Date(value)
    if (!isNaN(newDate.getTime())) {
      setEventDate(newDate)
    }
  }

  const renderEvent = ({ item }: { item: Event }) => {
    // Ensure user exists before checking ID
    const isAttending = user?.id ? item.attendees.includes(user.id) : false
    const isOrganizer = user?.id ? item.organizerId === user.id : false

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventPlaceholder}>
          <Ionicons name="calendar" size={40} color={Colors.primary} />
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.organizerName}>by {item.organizer.name}</Text>
          </View>

          <Text style={styles.eventDescription}>{item.description}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetailRow}>
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
            </View>

            <View style={styles.eventDetailRow}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.eventDetailText}>{item.location}</Text>
            </View>

            <View style={styles.eventDetailRow}>
              <Ionicons name="people" size={16} color={Colors.primary} />
              <Text style={styles.eventDetailText}>{item.attendees.length} attending</Text>
            </View>
          </View>

          <View style={styles.eventActions}>
            {!isOrganizer && user && (
              <TouchableOpacity
                style={[styles.attendButton, isAttending && styles.attendingButton]}
                onPress={() => handleAttendEvent(item)}
              >
                <Ionicons
                  name={isAttending ? "checkmark-circle" : "add-circle-outline"}
                  size={20}
                  color={isAttending ? Colors.textDark : Colors.textLight}
                />
                <Text style={[styles.attendButtonText, isAttending && styles.attendingButtonText]}>
                  {isAttending ? "Attending" : "Attend"}
                </Text>
              </TouchableOpacity>
            )}

            {isOrganizer && (
              <View style={styles.organizerBadge}>
                <Text style={styles.organizerBadgeText}>Organizer</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Events</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                placeholderTextColor="#888"
                value={eventTitle}
                onChangeText={setEventTitle}
              />

              <TextInput
                style={styles.textArea}
                placeholder="Event Description"
                placeholderTextColor="#888"
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor="#888"
                value={eventLocation}
                onChangeText={setEventLocation}
              />

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Event Date & Time</Text>
                <TextInput
                  style={styles.dateInput}
                  value={formatDateForInput(eventDate)}
                  onChangeText={handleDateChange}
                  placeholder="YYYY-MM-DDTHH:MM"
                  placeholderTextColor="#888"
                />
                <Text style={styles.dateHelper}>Format: YYYY-MM-DDTHH:MM (24-hour format)</Text>
              </View>

              <TouchableOpacity
                style={[styles.createEventButton, loading && styles.createEventButtonDisabled]}
                onPress={handleCreateEvent}
                disabled={loading}
              >
                <Text style={styles.createEventButtonText}>{loading ? "Creating..." : "Create Event"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  eventsList: {
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    padding: 16,
  },
  eventPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textLight,
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 12,
    color: "#888",
  },
  eventDescription: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
  },
  eventActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  attendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  attendingButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  attendButtonText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: "500",
  },
  attendingButtonText: {
    color: Colors.textDark,
  },
  organizerBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  organizerBadgeText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  modalForm: {
    padding: 20,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textLight,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textLight,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
    minHeight: 100,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textLight,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textLight,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 4,
  },
  dateHelper: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  createEventButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  createEventButtonDisabled: {
    opacity: 0.6,
  },
  createEventButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },
})
