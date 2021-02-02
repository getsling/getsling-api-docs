# Overview

This document explains how to work with timezones and timestamps while interacting with the API.

**TL;DR - Don't use timezone aware timestamps when interacting with the API.**

# Background

## Timezone Sensitive Objects

Some objects are innately connected to a timezone, like users and locations. Other objects are indirectly connected as a 
result, like shifts, which take place at a location. We will refer to these objects as being "timezone sensitive" for 
the remainder of this document.

Other objects relate to a specific point in time only, such as sales. We will refer to these objects as being 
"timezone insensitive" for the remainder of this document.


## User and Location Timezones
As stated above, users and locations are timezone sensitive objects, and so their timezone must be set.
However, this is **NOT** enforced by the API.

It is therefore the responsibility of the client to enforce non-null timezones for these objects.

In general, in the (unlikely) case where both user and location times are unset, the server will use the `UTC` timezone.
For the sake of calrity and simplicity, we assume in this document that users and location always have their timezones
set.

## World Clock

[The world clock](https://support.getsling.com/en/articles/2016187-does-sling-convert-shift-times-based-on-different-time-zones)
 is a feature that allows a user to see events in the timezone indicated in their profile. When disabled, the user will 
instead see events in the timezone of the location of the event.

It is important to understand that the world clock is only taken into consideration in regard to the schedule 
(calendar). In other words, it only relates to endpoints revolving around shifts and unavailabilities. Functionality 
like labor and payroll reports **NEVER** respect the world clock.

## Timestamps and Ranges

When interacting with the API, timestamps and ranges should **ALWAYS** follow ISO8601 standards.

Both naive and timezone aware timestamps will be accepted by the API. However, a timezone aware timestamp will be
**converted** (see [below](#Timezone Aware Timestamps)), so to avoid confusion and complexity it is highly recommended 
to use naive timezones. In particular, when using an API call with multiple timestamps (such as shift start, shift end 
and recurrence end), all timestamps should be either naive or aware (in which case they should have the same timezone).

# Examples

For the remainder of this section, we will assume the following:
* Your user profile is set to a `GMT-5` timezone.
* You have a single location in a `GMT+3` timezone
* You have a shift scheduled on March 4 2020 from 22:00 to 23:00 (UTC)

## Querying

The goal of the following examples is to query all shifts on March 4 2020.
As you read through the examples, keep in mind that shifts are timezone sensitive.
Endpoints that do not deal with timezone sensitive objects work exactly how you would
expect, the timestamp indicates a concrete point in time.

### Naive Timestamps

Querying all shifts on March 4 2020 without timezone identifiers would look like this:

```
2020-03-04T00:00:00/2020-03-05T00:00:00
```
or
```
2020-03-04T00:00:00/P1D
```

In this situation, the following will occur:

1. If world clock is enabled, the timezone is assumed to be that of the user.
   
   In this case, the UTC time range would be:
   ```
   2020-03-04T05:00:00/2020-03-05T05:00:00
   ```
   Therefore, the shift will be returned.
2. If world clock is disabled, the timezone is assumed to be that of the location. 
   In this case, the UTC time range would be:
   ```
   2020-03-03T21:00:00/2020-03-04T21:00:00
   ```
   Therefore, the shift will **NOT** be returned. To get the shift we would need to use `2020-03-05/2020-03-06`
   instead.

### Timestamps with Timezone

When using endpoints that deal with timezone sensitive objects, you generally do not
want to include a timezone offset. Imagine that you want to query for all shifts
on March 4 in YOUR timezone, and you are in `GMT-7`. Your dates might look like this:

```
 2020-03-04T00:00:00-07:00/2020-03-05T00:00:00-07:00
```

This makes sense for most APIs, where you are always providing a concrete point in time.
However, when using an endpoint that respects location, your timestamps would
actually get **converted** to the timezone chosen by the world clock setting or the location.
The general behavior of the API is as follows:

1. If world clock is enabled, the date range would be converted to the timezone of the user. 
   In our example, this means that our query would **ACTUALLY** be for the UTC range
   `2020-03-04T12:00:00/2020-03-05T12:00:00`
2. If world clock is disabled,  the date range would be converted to the timezone of the 
   location. In our example, this means that our query would **ACTUALLY** be for the UTC range
   `2020-03-04T04:00:00/2020-03-05T04:00:00`.
   
## Creating and Updating

Providing timestamps when creating or updating objects work by the same rules outlined
with querying. As mentioned earlier, this is only the case with calendar-related
objects like shifts and unavailability.

It is important to keep in mind that the world clock setting is taken into account
at the time the request is received. Regardless of what happens with the settings
in the future, the timestamp has already been interpreted and stored in UTC in
the database, according to the following rules.

### Naive Timestamps

1. If world clock is enabled, timezone is assumed to be that of the user's profile.
2. If world clock is disabled, timezone is assumed to be that of the location.

### Timezone Aware Timestamps

1. If world clock is enabled, timezone is **converted** to the timezone of the user's profile.
2. If world clock is disabled, timezone is **converted** to the timezone of the location.
