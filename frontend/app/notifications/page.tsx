"use client";
import Notification, { LoadingNotification } from "./notification";
import { useEffect, useRef } from "react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { getNotifications } from "@/api/notifications";
import { NOTIFICATION_LIMIT } from "@/types/constants";
import { GetNotificationsResponse } from "@/types/notifications";

export default function Page() {
    const observerTarget = useRef(null);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        GetNotificationsResponse,
        Error,
        InfiniteData<GetNotificationsResponse>,
        string[],
        number
    >({
        queryKey: ["notifications"],
        queryFn: ({ pageParam = 1 }) =>
            getNotifications({
                type: "web",
                page: pageParam,
                limit: NOTIFICATION_LIMIT,
            }),
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length < NOTIFICATION_LIMIT) {
                return undefined;
            }
            return allPages.length + 1;
        },
        initialPageParam: 1,
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <div className="p-15 bg-slate w-full items-center">
            <div className="flex row gap-5 pb-15">
                <h1 className="text-charcoal text-3xl font-bold"> Notifications </h1>
            </div>

            <div className="flex flex-col gap-5">
                {data?.pages.map((page, i) => (
                    <div key={i} className="flex flex-col gap-5">
                        {page.map((notification) => (
                            <Notification key={notification.id} notification={notification} />
                        ))}
                    </div>
                ))}
                {isFetchingNextPage && <LoadingNotification />}
                <div ref={observerTarget} className="self-center font-charcoal">
                    {!hasNextPage && <p>No More Notifications</p>}
                </div>
            </div>
        </div>
    );
}
