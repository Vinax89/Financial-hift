import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat_amount">Flat Amount ($)</SelectItem>
                          <SelectItem value="multiplier">Multiplier (x)</SelectItem>
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    <InputGroup label="Amount/Multiplier">
                      <Input
                        type="number"
                        step="0.01"
                        value={diff.amount}
                        onChange={event =>
                          handleDifferentialChange(
                            index,
                            "amount",
                            parseRequiredNumber(event.target.value),
                          )
                        }
                      />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Conditions (Optional)</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputGroup label="Start Time (HH:mm)">
                        <Input
                          type="time"
                          value={diff.conditions.start_time}
                          onChange={event =>
                            handleDifferentialConditionChange(
                              index,
                              "start_time",
                              event.target.value,
                            )
                          }
                        />
                      </InputGroup>
                      <InputGroup label="End Time (HH:mm)">
                        <Input
                          type="time"
                          value={diff.conditions.end_time}
                          onChange={event =>
                            handleDifferentialConditionChange(index, "end_time", event.target.value)
                          }
                        />
                      </InputGroup>
                    </div>
                    <div>
                      <Label>Days of Week</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DAYS_OF_WEEK.map(day => (
                          <Button
                            key={day}
                            type="button"
                            size="sm"
                            variant={
                              diff.conditions.days_of_week.includes(day) ? "primary" : "outline"
                            }
                            onClick={() => {
                              const nextDays = diff.conditions.days_of_week.includes(day)
                                ? diff.conditions.days_of_week.filter(existing => existing !== day)
                                : [...diff.conditions.days_of_week, day];

                              handleDifferentialConditionChange(index, "days_of_week", nextDays);
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addDifferential}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Differential
              </Button>
            </AccordionContent>
          </ThemedCard>
        </AccordionItem>

        <AccordionItem value="special_pay">
          <ThemedCard>
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Zap className="h-5 w-5" />
                Special Pay
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 grid md:grid-cols-3 gap-4">
              <InputGroup label="On-Call Rate ($/hr)">
                <Input
                  type="number"
                  step="0.01"
                  value={rule.special_pay.on_call_rate}
                  onChange={event =>
                    handleNestedChange(
                      "special_pay",
                      "on_call_rate",
                      parseRequiredNumber(event.target.value),
                    )
                  }
                />
              </InputGroup>
              <InputGroup label="Callback Multiplier">
                <Input
                  type="number"
                  step="0.1"
                  value={rule.special_pay.callback_multiplier ?? ""}
                  onChange={event =>
                    handleNestedChange(
                      "special_pay",
                      "callback_multiplier",
                      parseOptionalNumber(event.target.value),
                    )
                  }
                />
              </InputGroup>
              <InputGroup label="Callback Min. Hours">
                <Input
                  type="number"
                  value={rule.special_pay.callback_minimum_hours ?? ""}
                  onChange={event =>
                    handleNestedChange(
                      "special_pay",
                      "callback_minimum_hours",
                      parseOptionalNumber(event.target.value),
                    )
                  }
                />
              </InputGroup>
            </AccordionContent>
          </ThemedCard>
        </AccordionItem>

        <AccordionItem value="meal_breaks">
          <ThemedCard>
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Utensils className="h-5 w-5" />
                Meal Breaks
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-deduct-switch"
                  checked={rule.meal_break_rules.is_auto_deducted}
                  onCheckedChange={checked =>
                    handleNestedChange("meal_break_rules", "is_auto_deducted", checked)
                  }
                />
                <Label htmlFor="auto-deduct-switch">Auto-Deduct Unpaid Breaks</Label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InputGroup label="Required After (hours)">
                  <Input
                    type="number"
                    value={rule.meal_break_rules.unpaid_break_threshold ?? ""}
                    onChange={event =>
                      handleNestedChange(
                        "meal_break_rules",
                        "unpaid_break_threshold",
                        parseOptionalNumber(event.target.value),
                      )
                    }
                  />
                </InputGroup>
                <InputGroup label="Break Duration (minutes)">
                  <Input
                    type="number"
                    value={rule.meal_break_rules.break_duration ?? ""}
                    onChange={event =>
                      handleNestedChange(
                        "meal_break_rules",
                        "break_duration",
                        parseOptionalNumber(event.target.value),
                      )
                    }
                  />
                </InputGroup>
              </div>
            </AccordionContent>
          </ThemedCard>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <ThemedButton type="submit">{initialRule ? "Save Changes" : "Create Rule"}</ThemedButton>
      </div>
    </form>
  );
}

interface InputGroupProps {
  label: string;
  children: ReactNode;
}

const InputGroup = ({ label, children }: InputGroupProps): JSX.Element => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
  </div>
);import {
  useEffect,
  const handleNestedChange = <Section extends NestedSection, Key extends keyof ShiftRule[Section]>(
    section: Section,
    field: Key,
    value: ShiftRule[Section][Key],
  ): void => {
    setRule(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDifferentialChange = <Key extends keyof ShiftDifferential>(
    index: number,
    field: Key,
    value: ShiftDifferential[Key],
  ): void => {
    setRule(prev => {
      const updated = [...prev.differentials];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return { ...prev, differentials: updated };
    });
  };

  const handleDifferentialConditionChange = <Key extends keyof DifferentialConditions>(
    index: number,
    field: Key,
    value: DifferentialConditions[Key],
  ): void => {
    setRule(prev => {
      const updated = [...prev.differentials];
      updated[index] = {
        ...updated[index],
        conditions: {
          ...updated[index].conditions,
          [field]: value,
        },
      };

      return { ...prev, differentials: updated };
    });
  };

  const addDifferential = (): void => {
    setRule(prev => ({
      ...prev,
      differentials: [...prev.differentials, createDifferential()],
    }));
  };

  const removeDifferential = (index: number): void => {
    setRule(prev => ({
      ...prev,
      differentials: prev.differentials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSave(rule);
  };
  weekly_multiplier: number;
  daily_threshold?: number;
  daily_multiplier?: number;
  double_time_daily_threshold?: number;
  double_time_multiplier?: number;
}

interface SpecialPay {
  on_call_rate: number;
  callback_multiplier?: number;
  callback_minimum_hours?: number;
}

interface MealBreakRules {
  is_auto_deducted: boolean;
  unpaid_break_threshold?: number;
  break_duration?: number;
}

interface ShiftRule {
  name: string;
  description: string;
  base_hourly_rate: number;
  active: boolean;
  facility: string;
  overtime_rules: OvertimeRules;
  differentials: ShiftDifferential[];
  special_pay: SpecialPay;
  meal_break_rules: MealBreakRules;
}

interface ShiftRuleFormProps {
  onSave: (rule: ShiftRule) => void;
  onCancel: () => void;
  initialRule?: ShiftRule;
}

const generateTempId = (): string => `temp_${Math.random().toString(36).slice(2, 10)}`;

const createDifferential = (
  diff?: Partial<ShiftDifferential>
): ShiftDifferential => {
  const incomingDays = diff?.conditions?.days_of_week ?? [];
  const safeDays: DayOfWeek[] = Array.isArray(incomingDays)
    ? incomingDays.filter((day): day is DayOfWeek =>
        DAYS_OF_WEEK.includes(day as DayOfWeek)
      )
    : [];

  return {
    id: diff?.id ?? generateTempId(),
    name: diff?.name ?? "",
    type: (diff?.type as DifferentialType) ?? "custom",
    rate_type: (diff?.rate_type as RateType) ?? "flat_amount",
    amount: diff?.amount ?? 0,
    is_stackable: diff?.is_stackable ?? true,
    conditions: {
      start_time: diff?.conditions?.start_time ?? "",
      end_time: diff?.conditions?.end_time ?? "",
      days_of_week: safeDays,
    },
  };
};

const createEmptyRule = (): ShiftRule => ({
  name: "",
  description: "",
  base_hourly_rate: 0,
  active: true,
  facility: "",
  overtime_rules: {
    weekly_threshold: 40,
    weekly_multiplier: 1.5,
    daily_threshold: undefined,
    daily_multiplier: undefined,
    double_time_daily_threshold: undefined,
    double_time_multiplier: undefined,
  },
  differentials: [],
  special_pay: {
    on_call_rate: 0,
    callback_multiplier: undefined,
    callback_minimum_hours: undefined,
  },
  meal_break_rules: {
    is_auto_deducted: true,
    unpaid_break_threshold: undefined,
    break_duration: undefined,
  },
});

const mergeWithDefaults = (rule?: ShiftRule): ShiftRule => {
  const base = createEmptyRule();

  if (!rule) {
    return base;
  }

  return {
    ...base,
    ...rule,
    overtime_rules: { ...base.overtime_rules, ...rule.overtime_rules },
    special_pay: { ...base.special_pay, ...rule.special_pay },
    meal_break_rules: { ...base.meal_break_rules, ...rule.meal_break_rules },
    differentials: (rule.differentials ?? []).map(createDifferential),
  };
};

type NestedSection = "overtime_rules" | "special_pay" | "meal_break_rules";
type RootField = "name" | "description" | "facility";

const parseRequiredNumber = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const parseOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseFloat(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export default function ShiftRuleForm({
  onSave,
  onCancel,
  initialRule,
}: ShiftRuleFormProps) {
  const [rule, setRule] = useState<ShiftRule>(() =>
    mergeWithDefaults(initialRule)
  );

  useEffect(() => {
    setRule(mergeWithDefaults(initialRule));
  }, [initialRule]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    const key = name as RootField;

    setRule((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedChange = <Section extends NestedSection, Key extends keyof ShiftRule[Section]>(
    section: Section,
    field: Key,
    value: ShiftRule[Section][Key],
  ): void => {
    setRule(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDifferentialChange = <Key extends keyof ShiftDifferential>(
    index: number,
    field: Key,
    value: ShiftDifferential[Key],
  ): void => {
    setRule(prev => {
      const updated = [...prev.differentials];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return { ...prev, differentials: updated };
    });
  };

  const handleDifferentialConditionChange = <Key extends keyof DifferentialConditions>(
    index: number,
    field: Key,
    value: DifferentialConditions[Key],
  ): void => {
    setRule(prev => {
      const updated = [...prev.differentials];
      updated[index] = {
        ...updated[index],
        conditions: {
          ...updated[index].conditions,
          [field]: value,
        },
      };

      return { ...prev, differentials: updated };
    });
  };

  const addDifferential = (): void => {
    setRule(prev => ({
      ...prev,
      differentials: [...prev.differentials, createDifferential()],
    }));
  };

  const removeDifferential = (index: number): void => {
    setRule(prev => ({
      ...prev,
      differentials: prev.differentials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSave(rule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ThemedCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {initialRule ? "Edit Shift Rule" : "Create New Shift Rule"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InputGroup label="Rule Name">
              <Input
                name="name"
                value={rule.name}
                onChange={handleInputChange}
                placeholder="e.g., Hospital RN Contract 2024"
                required
              />
            </InputGroup>
            <InputGroup label="Facility/Company">
              <Input
                name="facility"
                value={rule.facility}
                onChange={handleInputChange}
                placeholder="e.g., General Hospital"
              />
            </InputGroup>
            <div className="md:col-span-2">
              <InputGroup label="Description">
                <Input
                  name="description"
                  value={rule.description}
                  onChange={handleInputChange}
                  placeholder="A brief description of this rule set"
                />
              </InputGroup>
            </div>
            <InputGroup label="Base Hourly Rate">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="base_hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rule.base_hourly_rate}
                  onChange={(event) =>
                    setRule((prev) => ({
                      ...prev,
                      base_hourly_rate: parseRequiredNumber(event.target.value),
                    }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </InputGroup>
            <div className="flex items-center space-x-4 pt-8">
              <Label htmlFor="active-switch">Rule Active</Label>
              <Switch
                id="active-switch"
                checked={rule.active}
                onCheckedChange={(checked) =>
                  setRule((prev) => ({ ...prev, active: checked }))
                }
              />
            </div>
          </div>
        </div>
      </ThemedCard>

      <Accordion
        type="multiple"
        defaultValue={["overtime", "differentials"]}
        className="w-full space-y-4"
      >
        <AccordionItem value="overtime">
          <ThemedCard>
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                Overtime Rules
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 space-y-4">
              <h4 className="font-semibold">Weekly Overtime</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <InputGroup label="Threshold (hours/week)">
                  <Input
                    type="number"
                    value={rule.overtime_rules.weekly_threshold}
                    onChange={(event) =>
                      handleNestedChange(
                        "overtime_rules",
                        "weekly_threshold",
                        parseRequiredNumber(event.target.value)
                      )
                    }
                  />
                </InputGroup>
                <InputGroup label="Multiplier">
                  <Input
                    type="number"
                    step="0.1"
                    value={rule.overtime_rules.weekly_multiplier}
                    onChange={(event) =>
                      handleNestedChange(
                        "overtime_rules",
                        "weekly_multiplier",
                        parseRequiredNumber(event.target.value)
                      )
                    }
                  />
                </InputGroup>
              </div>
              <h4 className="font-semibold">Daily Overtime</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <InputGroup label="Threshold (hours/day)">
                  <Input
                    type="number"
                    value={rule.overtime_rules.daily_threshold ?? ""}
                    onChange={(event) =>
                      handleNestedChange(
                        "overtime_rules",
                        "daily_threshold",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                    placeholder="e.g., 8 or 12"
                  />
                </InputGroup>
                <InputGroup label="Multiplier">
                  <Input
                    type="number"
                    step="0.1"
                    value={rule.overtime_rules.daily_multiplier ?? ""}
                    onChange={(event) =>
                      handleNestedChange(
                        "overtime_rules",
                        "daily_multiplier",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </InputGroup>
              </div>
              <h4 className="font-semibold">Double Time</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <InputGroup label="Daily Threshold (hours)">
                  <Input
                    type="number"
                    value={
                      rule.overtime_rules.double_time_daily_threshold ?? ""
                    }
                    onChange={(event) =>
                      handleNestedChange(
                        "overtime_rules",
                        "double_time_daily_threshold",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                    placeholder="e.g., 12"
                  />
                </InputGroup>
                <InputGroup label="Multiplier">
                  <Input
                    type="number"
                    step="0.1"
                    value={rule.overtime_rules.double_time_multiplier ?? ""}
                    onChange={(event) =>
                      handleNestedChange(
                        "overtime_rules",
                        "double_time_multiplier",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </InputGroup>
              </div>
            </AccordionContent>
          </ThemedCard>
        </AccordionItem>

        <AccordionItem value="differentials">
          <ThemedCard>
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BadgePercent className="h-5 w-5" />
                Pay Differentials
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 space-y-6">
              {rule.differentials.map((diff, index) => (
                <div
                  key={diff.id || index}
                  className="p-4 rounded-lg border bg-muted/50 space-y-4 relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-destructive"
                    onClick={() => removeDifferential(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="grid md:grid-cols-3 gap-4">
                    <InputGroup label="Differential Name">
                      <Input
                        value={diff.name}
                        onChange={(event) =>
                          handleDifferentialChange(
                            index,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="e.g., Night Shift Pay"
                      />
                    </InputGroup>
                    <InputGroup label="Type">
                      <Select
                        value={diff.type}
                        onValueChange={(val) =>
                          handleDifferentialChange(
                            index,
                            "type",
                            val as DifferentialType
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFERENTIAL_TYPES.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="capitalize"
                            >
                              {type.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        checked={diff.is_stackable}
                        onCheckedChange={(checked) =>
                          handleDifferentialChange(
                            index,
                            "is_stackable",
                            checked
                          )
                        }
                      />
                      <Label>Stackable</Label>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputGroup label="Rate Type">
                      <Select
                        value={diff.rate_type}
                        onValueChange={(val) =>
                          handleDifferentialChange(
                            index,
                            "rate_type",
                            val as RateType
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat_amount">
                            Flat Amount ($)
                          </SelectItem>
                          <SelectItem value="multiplier">
                            Multiplier (x)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    <InputGroup label="Amount/Multiplier">
                      <Input
                        type="number"
                        step="0.01"
                        value={diff.amount}
                        onChange={(event) =>
                          handleDifferentialChange(
                            index,
                            "amount",
                            parseRequiredNumber(event.target.value)
                          )
                        }
                      />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Conditions (Optional)</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputGroup label="Start Time (HH:mm)">
                        <Input
                          type="time"
                          value={diff.conditions.start_time}
                          onChange={(event) =>
                            handleDifferentialConditionChange(
                              index,
                              "start_time",
                              event.target.value
                            )
                          }
                        />
                      </InputGroup>
                      <InputGroup label="End Time (HH:mm)">
                        <Input
                          type="time"
                          value={diff.conditions.end_time}
                          onChange={(event) =>
                            handleDifferentialConditionChange(
                              index,
                              "end_time",
                              event.target.value
                            )
                          }
                        />
                      </InputGroup>
                    </div>
                    <div>
                      <Label>Days of Week</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <Button
                            key={day}
                            type="button"
                            size="sm"
                            variant={
                              diff.conditions.days_of_week.includes(day)
                                ? "primary"
                                : "outline"
                            }
                            onClick={() => {
                              const nextDays =
                                diff.conditions.days_of_week.includes(day)
                                  ? diff.conditions.days_of_week.filter(
                                      (existing) => existing !== day
                                    )
                                  : [...diff.conditions.days_of_week, day];

                              handleDifferentialConditionChange(
                                index,
                                "days_of_week",
                                nextDays
                              );
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addDifferential}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Differential
              </Button>
            </AccordionContent>
          </ThemedCard>
        </AccordionItem>

        <AccordionItem value="special_pay">
          <ThemedCard>
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Zap className="h-5 w-5" />
                Special Pay
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 grid md:grid-cols-3 gap-4">
              <InputGroup label="On-Call Rate ($/hr)">
                <Input
                  type="number"
                  step="0.01"
                  value={rule.special_pay.on_call_rate}
                  onChange={(event) =>
                    handleNestedChange(
                      "special_pay",
                      "on_call_rate",
                      parseRequiredNumber(event.target.value)
                    )
                  }
                />
              </InputGroup>
              <InputGroup label="Callback Multiplier">
                <Input
                  type="number"
                  step="0.1"
                  value={rule.special_pay.callback_multiplier ?? ""}
                  onChange={(event) =>
                    handleNestedChange(
                      "special_pay",
                      "callback_multiplier",
                      parseOptionalNumber(event.target.value)
                    )
                  }
                />
              </InputGroup>
              <InputGroup label="Callback Min. Hours">
                <Input
                  type="number"
                  value={rule.special_pay.callback_minimum_hours ?? ""}
                  onChange={(event) =>
                    handleNestedChange(
                      "special_pay",
                      "callback_minimum_hours",
                      parseOptionalNumber(event.target.value)
                    )
                  }
                />
              </InputGroup>
            </AccordionContent>
          </ThemedCard>
        </AccordionItem>

        <AccordionItem value="meal_breaks">
          <ThemedCard>
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Utensils className="h-5 w-5" />
                Meal Breaks
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-deduct-switch"
                  checked={rule.meal_break_rules.is_auto_deducted}
                  onCheckedChange={(checked) =>
                    handleNestedChange(
                      "meal_break_rules",
                      "is_auto_deducted",
                      checked
                    )
                  }
                />
                <Label htmlFor="auto-deduct-switch">
                  Auto-Deduct Unpaid Breaks
                </Label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InputGroup label="Required After (hours)">
                  <Input
                    type="number"
                    value={rule.meal_break_rules.unpaid_break_threshold ?? ""}
                    onChange={(event) =>
                      handleNestedChange(
                        "meal_break_rules",
                        "unpaid_break_threshold",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </InputGroup>
                <InputGroup label="Break Duration (minutes)">
                  <Input
                    type="number"
                    value={rule.meal_break_rules.break_duration ?? ""}
                    onChange={(event) =>
                      handleNestedChange(
                        "meal_break_rules",
                        "break_duration",
                        parseOptionalNumber(event.target.value)
                      )
                    }
                  />
                </InputGroup>
              </div>
            </AccordionContent>
          </ThemedCard>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <ThemedButton type="submit">
          {initialRule ? "Save Changes" : "Create Rule"}
        </ThemedButton>
      </div>
    </form>
  );
}

interface InputGroupProps {
  label: string;
  children: ReactNode;
}

const InputGroup = ({ label, children }: InputGroupProps): JSX.Element => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
  </div>
);
