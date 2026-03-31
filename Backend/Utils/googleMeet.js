import { google } from "googleapis";

export const createGoogleMeet = async ({
  summary,
  date,
  time,
  attendees,
  accessToken
}) => {
  if (!accessToken) {
    throw new Error("Access token missing");
  }

  // ✅ Direct token use
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  // ✅ Date handling
  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

  const event = {
    summary: summary || "Interview - CodifyX",
    description: "Interview scheduled via CodifyX",

    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "Asia/Kolkata",
    },

    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "Asia/Kolkata",
    },

    attendees: attendees
      ? attendees.map((email) => ({ email }))
      : [],

    conferenceData: {
      createRequest: {
        requestId: Date.now().toString(),
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  console.log("GOOGLE RESPONSE:", response.data);

  return response.data.hangoutLink;
};