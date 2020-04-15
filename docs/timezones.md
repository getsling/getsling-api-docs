# Overview

This document explains how to work with timezones and timestamps while interacting with the API.

# Background

## Timezone Sensitive Objects

Some objects are innately connected to a timezone, like locations. Other objects are
indirectly connected as a result, like shifts, which take place at a location. We
will refer to these objects as being "timezone sensitive" for the remainder
of this document.

Other objects relate to a specific point in time only, such as sales. We will refer
to these objects as being "timezone insensitive" for the remainder of this document.

## World Clock

[The world clock](https://support.getsling.com/en/articles/2016187-does-sling-convert-shift-times-based-on-different-time-zones)
 is a feature that allows a user to see events in the timezone indicated in their
profile. When disabled, the user will instead see events in the timezone of the location of the
event.

It is important to understand that the world clock is only taken into consideration
in regards to the schedule (calendar). In other words, it only relates to endpoints
revolving around shifts and unavailabilities. Functionality like labor and payroll
reports **NEVER** respect the world clock.

## Timestamps and Ranges

When interacting with the API, timestamps and ranges should always follow ISO8601 standards.

Both naive and timezone aware timestamps will be accepted by the API. Of course, in
situations where you are filtering with multiple timestamps (such as start/end),
both timestamps will need to be either naive or aware.

# Examples

For the remainder of this section, we will assume the following:
* You have a single location in a `GMT+0` timezone
* Your user profile is set to a `GMT+2` timezone.
* You have a shift scheduled on March 4 2020 from 23:00 to 23:30 (UTC)

## Querying

The goal of the following examples is to query all shifts on March 4 2020.
As you read through the examples, keep in mind that shifts are timezone sensitve.
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
2. If world clock is disabled, the timezone is assumed to be that of the location.

This means that using the date range above, the shift would be returned from the API
if world clock is disabled. However, if world clock is enabled, the shift would not be
returned. This is because the shift actually occurs on March 5 2020 according to the
user's timezone, so we would need to use `2020-03-05/2020-03-06` instead.

### Timestamps with Timezone

When using endpoints that deal with timezone sensitive objects, you generally do not
want to include a timezone offset. Imagine that you want to query for all shifts
on March 4 in YOUR timezone and you are in`EST (GMT-5)`. Your dates might look like this:

```
 2020-03-04T00:00:00-0500/2020-03-05T00:00:00-0500
```

This makes sense for most APIs, where you are always providing a concrete point in time.
However, when using an endpoint that respects location, your timestamps would
actually get **converted** to the timezone chosen by the world clock setting or the location.
In the example above, the following would occur:

1. If world clock is disabled, the date range would be converted to the timezone of
   the location (GMT+0). This would mean that your query would **ACTUALLY** be for
   the range `2020-03-04T00:05:00/2020-03-05T00:05:00`
2. If world clock is enabled, the date range would be converted to the timezone of
   the user (GMT+2). This means that your query would **ACTUALLY** be for the range
   `2020-03-04T00:07:00/2020-03-05T00:07:00`

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
2. If world clock is disabled, timezone is assumed to be that of the shift's location.


### Timezone Aware Timestamps

1. If world clock is enabled, timestamp is **converted** to the timezone of the user's profile.
2. If world clock is disabled, timestamp is **converted** to the timezone of the shift's location.
