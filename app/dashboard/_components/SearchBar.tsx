import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileSearchIcon, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  query: z.string().min(0).max(200),
});

export function SearchBar({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query,
  setQuery,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>){
    setQuery(values.query);
  }

  return (
    <>
      <div className="flex gap-4 items-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex mb-6">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Your file names" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isLoading}
              className="mx-5"
            >
              {form.formState.isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <FileSearchIcon className="w-20 h-20" /> Search
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
